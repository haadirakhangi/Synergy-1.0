from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from deep_translator import GoogleTranslator
from lingua import LanguageDetectorBuilder
from iso639 import Lang
from flask import Flask,session,request,jsonify
from pdf2image import convert_from_path
import google.generativeai as genai
from langchain_core.runnables import RunnablePassthrough
import time
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_core.output_parsers import PydanticOutputParser
import ast
import openai
import cv2
import os
import re
import json
from pymongo import MongoClient
import shutil
from PIL import Image
from gridfs import GridFS

load_dotenv(find_dotenv())
app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']
GOOGLE_API_KEY = os.environ['GOOGLE_API_KEY']
openai.api_key = os.environ['OPENAI_API_KEY']
genai.configure(api_key = GOOGLE_API_KEY)
generation_config = {
  "temperature": 0.0,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

passw = os.getenv("passw")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
connection_string = f"mongodb+srv://hatim:{passw}@cluster0.f7or37n.mongodb.net/?retryWrites=true&w=majority"


EMBEDDINGS = OpenAIEmbeddings()



tools = [
    {
        'type': 'function',
        'function': {

            'name': 'retrieval_augmented_generation',
            'description': 'Fetches information about Mindcraft\'s platform to answer user\'s query',
            'parameters': {
                'type': 'object',
                'properties': {
                    'query': {
                        'type': 'string',
                        'description': 'The query to use for searching the vector database of Mindcraft'
                    },
                },
                'required': ['query']
            }
        }
    },
]
detector = LanguageDetectorBuilder.from_all_languages().with_preloaded_language_models().build()

client = OpenAI(api_key=openai.api_key)
assistant = client.beta.assistants.create(
    name="SEQUUS",
    instructions="You are an assistant for the SEQUUS website and you will be given a document from the user. Help the user with their queries about the document. Use the tools provided to you to answer the user queries.",
    model="gpt-3.5-turbo-1106",
    tools=tools
)
thread = client.beta.threads.create()
assistant_id = assistant.id
thread_id = thread.id

def MongoDB(collection_name):
    client = MongoClient(connection_string)
    db = client.get_database("SEQUUS")
    records = db.get_collection(collection_name)
    fs = GridFS(db)

    def insert_document_with_file(document, file_path):
        # Insert document information
        record_id = records.insert_one(document).inserted_id

        # Store the PDF file in GridFS
        with open(file_path, 'rb') as file:
            fs.put(file, filename=record_id)

    return records, insert_document_with_file

#build directories
def build_directory_structure(path):
    result = {'name': os.path.basename(path), 'toggled': True}
    try:
        contents = os.listdir(path)
        result['children'] = [
            build_directory_structure(os.path.join(path, child))
            for child in contents
        ]
    except Exception as e:
        print(f"Error building structure for {path}: {e}")
    return result

def count_projects(path):
    try:
        # List all items in the directory
        contents = os.listdir(path)
        
        # Count the number of directories (projects)
        project_count = sum(os.path.isdir(os.path.join(path, item)) for item in contents)
        
        return project_count
    except Exception as e:
        print(f"Error counting projects: {e}")
        return 0  # Return 0 in case of an error

def count_files_recursively(path):
    file_count = 0
    try:
        for root, dirs, files in os.walk(path):
            file_count += len(files)
        
        return file_count
    except Exception as e:
        print(f"Error counting files: {e}")
        return 0  # Return 0 in case of an error


# Bottom crop funtion
def crop_bottom(input_image_path):
    image = cv2.imread(input_image_path)
    
    height, width = image.shape[:2]
    crop_height = int(height * 0.15)
    crop_region = image[height - crop_height:height]
    pil_image = Image.fromarray(cv2.cvtColor(crop_region, cv2.COLOR_BGR2RGB))
    return pil_image

#side crop function
def crop_right(input_image_path):
    image = cv2.imread(input_image_path)
    
    height, width = image.shape[:2]
    crop_width = int(width * 0.15)
    crop_region = image[0:height, width - crop_width:width]
    pil_image = Image.fromarray(cv2.cvtColor(crop_region, cv2.COLOR_BGR2RGB))
    return pil_image

def get_dict_from_json(response):
    pattern = re.compile(r'{.*}', re.DOTALL)
    match = pattern.search(response.text)
    if match:
        matched_json = match.group()
        cleaned_json = matched_json.replace('\\n', '').replace('\n', '')
        try:
            data_dict = json.loads(cleaned_json)
            print(data_dict)
            return data_dict
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
    else:
        print("No valid JSON found in the input string.")

def retrieval_augmented_generation(query):
    VECTORDB = FAISS.load_local('assistant_data/faiss_index_assistant', EMBEDDINGS)
    relevant_docs = VECTORDB.similarity_search(query)
    rel_docs = [doc.page_content for doc in relevant_docs]
    output = '\n'.join(rel_docs)
    print(output)
    return output

def wait_on_run(run_id, thread_id):
    client = OpenAI(api_key=openai.api_key)
    while True:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id,
        )
        print('RUN STATUS', run.status)
        time.sleep(0.5)
        if run.status in ['failed', 'completed', 'requires_action']:
            return run
        
available_tools = {
    'retrieval_augmented_generation': retrieval_augmented_generation,
}
        
def submit_tool_outputs(thread_id, run_id, tools_to_call):
    tools_outputs = []
    for tool in tools_to_call:
        output = None
        tool_call_id = tool.id
        tool_name = tool.function.name
        tool_args = tool.function.arguments
        print('TOOL CALLED:', tool_name)
        print('ARGUMENTS:', tool_args)
        tool_to_use = available_tools.get(tool_name)
        if tool_name =='retrieval_augmented_generation':
            tool_args_dict = ast.literal_eval(tool_args)
            query = tool_args_dict['query']
            output = tool_to_use(query)
        if tool_name == 'get_context_from_page':
            tool_args_dict = ast.literal_eval(tool_args)
            query = tool_args_dict['query']
            output = tool_to_use(query)
        if output:
            tools_outputs.append(
                {'tool_call_id': tool_call_id, 'output': output})

    return client.beta.threads.runs.submit_tool_outputs(thread_id=thread_id, run_id=run_id, tool_outputs=tools_outputs)


# Pydantic class for langchain schema
class Extraction(BaseModel):
  """Information to extract from the document"""
  project_number : str = Field(description = 'The project number from the document')
  document_name : str = Field(description = 'The name of the document. Ex. Acoustic, Internal Finishes, Hardware, etc.')
  category : str = Field(description = 'The caegory of the document. Ex. Report, Specification, Schedule, Scope of Work, etc.')
  date : str = Field(description= 'The date of the latest issue')  

@app.route('/get-category', methods=['POST'])
def get_category():
    project_name = request.form['projectName']
    project_name = project_name.replace(" ", "-")
    prompt = "Analyze the following image and provide a json output that defines which category the image falls in. Also classify the image as either a construction plan or other document. The keys of the json response should be 'category' with the corresponding output being the category the project title and the second key should be 'document_type' with one of the classisfications: 'construction_plan' or 'other_document'. The third key should be the 'index_position' with the value being the position where the index of the construction plan is present (bottom or right). Refer to the examples given to determine this position. If it is not a construction plan return None. Analyze the image carefully and give the json response as described."
    model = genai.GenerativeModel('gemini-pro-vision', generation_config= generation_config)
    construction_image_example = Image.open('final.jpeg')
    print(f"Project Name: {project_name}")
    project_directory = os.path.join("uploads", project_name)
    files = request.files.getlist('files')
    if not os.path.exists(project_directory):
        os.makedirs(project_directory)
        # Access multiple files
    for file in files:
        file_path = os.path.join(project_directory, file.filename)
        image_path = os.path.join(project_directory, 'img.jpeg')
        session['file_path'] = file_path
        session['image_path'] = image_path
        session['project_name'] = project_name
        # Save the file in the project-specific directory
        file.save(file_path)
        print(f"Saved file: {file_path}")
        images = convert_from_path(file_path,poppler_path="C:/Program Files (x86)/poppler-24.02.0/Library/bin")
        if len(images)>1:
            first_page = images[0]
            second_page = images[1]
            images[0].save(image_path, 'JPEG')
            response = model.generate_content(['The following is an example of a construction plan with the index at the bottom',construction_image_example, prompt, first_page, second_page])
        else:
            first_page = images[0]
            images[0].save(image_path, 'JPEG')
            response = model.generate_content(['The following is an example of a construction plan.',construction_image_example, prompt, first_page])
        response.resolve()
        # data_dict1 = {'category': 'Electrical', 'document_type': 'construction_plan', 'index_position': 'bottom'}
        data_dict1 = get_dict_from_json(response)
    return jsonify({'message': 'Files uploaded successfully',"info": data_dict1, "path": file_path}), 200

@app.route('/confirm-details', methods=['POST'])
def confirm_details():
    data = request.get_json()
    print("Data",data)
    image_path = session['image_path']
    file_path = session['file_path']
    project_name = session['project_name']
    print("file path",file_path)
    if data['document_type'] == 'construction_plan':            
        if data['index_position'] == 'right':
            cropped_image = crop_right(input_image_path=image_path)
        elif data['index_position'] == 'bottom':
            cropped_image = crop_bottom(input_image_path=image_path)
        prompt_two = "Analyze the following image and provide a json output with the following keys:\n'drawing_status' : //The drawing status mentioned in the image\n'drawing_number' : // The drawing number in the image\n'revision' : // The revision of the drawing\n'title' : // The title of the construction image\n'date' : // The date on the right side. Analyze the image carefully and create a json output with the corresponding values as described."

        model = genai.GenerativeModel('gemini-pro-vision', generation_config=generation_config)
        response_two = model.generate_content([prompt_two, cropped_image], stream=True)
        response_two.resolve()
        data_dict2 = get_dict_from_json(response_two)
        print("Output:- ",data_dict2)
        date = data_dict2['date'].replace("/","_")
        new_filename = data_dict2['drawing_number']+"_"+data_dict2['revision']+"_"+data_dict2['drawing_status']+"_"+date+".pdf"
        new_directory = os.path.join("projects",project_name,data['category'],data['document_type'])
        path = os.path.join(new_directory, new_filename)
        if not os.path.exists(new_directory):
            os.makedirs(new_directory)
        shutil.move(file_path, os.path.join(new_directory, new_filename))
        mongo_collection, insert_document = MongoDB(project_name)
        document_to_insert = {
            'project_name': project_name,
            'category': data['category'],
            'document_type': data['document_type'],
            'info': data_dict2,
            'path': path,
        }
        insert_document(document_to_insert, path)
        return jsonify({'message': 'Details confirmed successfully','info': data_dict2,'path': path})
    else:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size = 1000, chunk_overlap = 200)
        documents = text_splitter.split_documents(docs)
        embeddings = OpenAIEmbeddings()
        vectorstore = FAISS.from_documents(documents, embeddings)
        retriever = vectorstore.as_retriever()
        model = ChatOpenAI(model = 'gpt-3.5-turbo-1106', temperature=0.0)
        template = """
        {question}
        {format_instructions}
        Document: {context}
        """
        prompt = ChatPromptTemplate.from_template(template)
        output_parser = PydanticOutputParser(pydantic_object = Extraction)
        format_instructions = output_parser.get_format_instructions()
        prompt_template = prompt.partial(format_instructions = format_instructions)
        chain = RunnablePassthrough.assign(context = lambda x: retriever.get_relevant_documents(x['question'])) | prompt_template | model  | output_parser
        response = chain.invoke({"question": "Extract the following information from the document: Project Number, document name(ex. Acoustic, Internal Finishes, Hardware),category(ex. report, specification, schedule, scope of work) and the date. The format instructions are: "})
        print("Output:- ",response)
        date = response.date.replace(" ","_")
        new_filename = response.project_number+"_"+response.document_name+"_"+"_"+date+".pdf"
        new_directory = os.path.join("projects",project_name,data['category'],data['document_type'],response.category)
        path = os.path.join(new_directory, new_filename)
        if not os.path.exists(new_directory):
            os.makedirs(new_directory)
        shutil.move(file_path, os.path.join(new_directory, new_filename))
        mongo_collection, insert_document = MongoDB(project_name)
        document_to_insert = {
            'project_name': project_name,
            'category': data['category'],
            'document_type': data['document_type'],
            'info': {
                'project_number': response.project_number,
                'document_name': response.document_name,
                'category': response.category,
                'date': date,
            },
            'path': path,
        }
        insert_document(document_to_insert, path)
        return jsonify({'message': 'Details confirmed successfully','path': path})

@app.route('/dashboard')
def dashboard():
    root_path = 'projects'  # Replace with the actual path to your projects directory
    num_projects = count_projects(root_path)
    print("Number of projects:- ", num_projects)
    total_files = count_files_recursively(root_path)
    print("Number of Files:- ", total_files)
    directory_structure = build_directory_structure(root_path)
    response_data = {
        'num_projects': num_projects,
        'num_files': total_files,
        'directory_structure': directory_structure
    }
    return jsonify(response_data)

@app.route('/upload-file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Save the file to the uploads directory
        file_path = os.path.join('assistant_data', file.filename)
        file.save(file_path)
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    docs_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = docs_splitter.split_documents(docs)
    
    ASSISTANT_VECTORSTORE = FAISS.from_documents(split_docs, EMBEDDINGS)
    ASSISTANT_VECTORSTORE.save_local('assistant_data/faiss_index_assistant')
    print('CREATED VECTORSTORE')
    return jsonify({'chatbotResponse': 'File uploaded successfully'})

@app.route('/chatbot-route', methods=['POST'])
def chatbot_route():
    data = request.get_json()
    print(data)
    tool_check = []
    query = data.get('userdata', '')
    if query:
        source_language = Lang(str(detector.detect_language_of(query)).split('.')[1].title()).pt1
        if source_language != 'en':
            trans_query = GoogleTranslator(source=source_language, target='en').translate(query)
        else:
            trans_query = query
        print('ASSISTANT ID', assistant_id)
        print('THREAD ID', thread_id)
        print(trans_query)
        message = client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content= trans_query,
        )
        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id,
        )
        run = wait_on_run(run.id, thread_id)

        if run.status == 'failed':
            print(run.error)
        elif run.status == 'requires_action':
            run = submit_tool_outputs(thread_id, run.id, run.required_action.submit_tool_outputs.tool_calls)
            run = wait_on_run(run.id,thread_id)
        messages = client.beta.threads.messages.list(thread_id=thread_id,order="asc")
        print('message',messages)
        content = None
        for thread_message in messages.data:
            content = thread_message.content
        print("Content List", content)
        if len(tool_check) == 0:
            chatbot_reply = content[0].text.value
            print("Chatbot reply",chatbot_reply)
            if source_language != 'en':
                trans_output = GoogleTranslator(source='auto', target=source_language).translate(chatbot_reply)
            else:
                trans_output = chatbot_reply
            response = {'chatbotResponse': trans_output,'function_name': 'normal_search'}
        return jsonify(response)
    else:
        return jsonify({'error': 'User message not provided'}), 400

@app.route('/logout')
def logout():
    session.clear()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
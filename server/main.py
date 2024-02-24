import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from flask import Flask,session,request,jsonify
from langchain_community.llms.gpt4all import GPT4All
import os

load_dotenv(find_dotenv())


app = Flask(__name__)

OPEN_SOURCED_MODEL_PATH_HATIM = 'E:/DJ SANGHVI- AIML DEGREE/DEGREE/HACKATHON/PROJECTS/Techgium/mistral-7b-instruct-v0.1.Q4_0.gguf'
OPEN_SOURCED_LLM = GPT4All(model= OPEN_SOURCED_MODEL_PATH_HATIM)
OPENAI_MODEL = 'gpt-3.5-turbo-1106'
TEMPERATURE =  0.0
output_parser = StrOutputParser()
OPENAI_LLM = ChatOpenAI(model= OPENAI_MODEL, temperature=TEMPERATURE)

os.environ['LANGCHAIN_TRACING_V2']= "true"
os.environ['LANGCHAIN_ENDPOINT']= "https://api.smith.langchain.com"
os.environ['LANGCHAIN_API_KEY']= "ls__c7b403388bb9404bb123708872b16af6"
os.environ['LANGCHAIN_PROJECT']= "learning-langsmith"

@app.route('/get-optimizeprompt',methods=['POST'])
def get_optimizeprompt():
    try:
        data = request.get_json()
        initial_prompt = data.get('initialPrompt', '')
        print("Initial Prompt:- ", initial_prompt)
        initial_prompt_template = """You will be given a prompt and your task is to optimize the prompt by understanding the user's required output. Please provide an optimized prompt for the following prompt. \
        Prompt = {prompt}"""
        prompt_template = ChatPromptTemplate.from_template(initial_prompt_template)
        chain = prompt_template | OPENAI_LLM | output_parser
        optimized_prompt = chain.invoke({"prompt": initial_prompt})
        print("Optimied prompt:- ",optimized_prompt)
        return jsonify({'optimized_prompt': optimized_prompt})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-output',methods=['POST'])
def get_output():
    try:
        data = request.get_json()
        optimized_prompt = data.get('optimizedPrompt', '')
        print("Optimized Prompt", optimized_prompt)
        output_prompt = ChatPromptTemplate.from_template("{input}")
        output_chain = output_prompt | OPEN_SOURCED_LLM | output_parser
        output = output_chain.invoke({"input": optimized_prompt})
        print("Output:", output)
        return jsonify({'output': output})
    
    except Exception as e:
        # Handle errors
        return jsonify({'error': str(e)}), 500

@app.route('/submit-feedback',methods=['POST'])
def submit_feedeback():
    try:
        data = request.get_json()
        feedback = data.get('feedback', '')
        optimized_prompt = data.get('optimizedPrompt', '')
        print("Optimized Prompt", optimized_prompt)
        print("Feedback", feedback)
        feedback_prompt = """You will be given an older prompt given to a Language Model, the output from the language model and feedback\
        from a user. Optimize the older prompt to generate an output based on the feedback.
    
        Old Prompt: {old_prompt}
        Feedback: {feedback}\n\n\n
    
        Construct a better and complete prompt considering the above feedback"""
        feedback_template = ChatPromptTemplate.from_template(feedback_prompt)
        feedback_chain = feedback_template | OPENAI_LLM | output_parser
        prompt_after_feedback = feedback_chain.invoke({"old_prompt": optimized_prompt, "feedback": feedback}) 
        print("prompt_after_feedback:- ", prompt_after_feedback)
        return jsonify({'prompt_after_feedback': prompt_after_feedback})
    
    except Exception as e:
        # Handle errors
        return jsonify({'error': str(e)}), 500



@app.route('/logout')
def logout():
    session.clear()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
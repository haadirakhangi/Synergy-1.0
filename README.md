# Synergy-1.0
Code Omega Synergy 1.0

Explore our sophisticated Construction Document Management project designed to revolutionize the intricacies of document handling in the construction industry. In this dynamic sector, streamlined document management is a prerequisite for effective collaboration and project success. Our solution addresses critical challenges, including disorganized files, time-consuming searches, and manual errors. Leveraging state-of-the-art technologies such as AI/ML models and advanced document processing techniques, the project automates document classification, augments data extraction, and establishes a standardized file management system. Throughout development, we navigated challenges related to information extraction, explored diverse methods, and adeptly resolved issues in file types and prompt engineering. This project signifies a commitment to advancing construction document management, enhancing efficiency, and elevating the overall project workflow.

To install and set up the project through GitHub, follow these steps:

1. Clone the repository using the git clone command:

```bash
git clone https://github.com/haadirakhangi/Synergy_Code_Omega.git
```

2. Change the directory to the client:

```bash
cd .\client
```

3. Install the npm packages:

```bash
npm i
```

4. Run the frontend:

```bash
npm run dev
```

5. Start another terminal and change to the server directory:

```bash
cd .\server
```

6. Create a virtual environment:

```bash
pip install virtualenv
virtualenv myenv
```

7. Activate the virtual environment:

```bash
.\myenv\Scripts\activate
```

8. Install the requirements in the virtual environment:

```bash
pip install -r requirements.txt
```

9. Create an environment file (env file) in the server directory and add the following API keys:

Example env file:

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
SECRET_KEY=YOUR_SECRET_KEY_FOR_CREATING_FLASK_SESSION_HERE
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

10. Run the following command in the command line:

```bash
python main.py
```

This set of instructions guides you through the entire process, from cloning the repository to running the project with the necessary configurations.


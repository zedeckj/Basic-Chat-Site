This simple chatbox project was built with ReactJS and Flask. Users can sign in under any username and message with a simple chatbot. The backend uses Amazon's DynamoDB to store each users message history, and uses OpenAI'
s gpt-3.5-turbo to respond to messages. User's can exit the page, sign back in, and still view their old message log, which can be manually deleted. To launch this project:

1) setup .env file with the following keys:
```
OPENAI_API_KEY= ...
AWS_API_KEY= ...
AWS_SECRET_KEY= ...

2) run: 
```
./start_backend
npm run start
```

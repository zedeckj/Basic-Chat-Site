import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import time
import boto3
from dotenv import dotenv_values

def_messages = [{"role": "system", "content": "You are on a user on an instant messaging website. You are talking to someone you have never met before. You should use an sms texting style in your responses. Only type in lower case and dont use any question marks or commas."}]
config = dotenv_values(".env")
messages = [*def_messages]
client = OpenAI()
client.api_key = config["OPENAI_API_KEY"]

app = Flask(__name__)
CORS(app)



dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=config["AWS_API_KEY"],
    aws_secret_access_key=config["AWS_SECRET_KEY"],
    region_name = "us-east-2"
)

table = dynamodb.Table('interview-chat')

@app.route("/fetch/<username>", methods = ["GET", "DELETE"])
def get_messages(username):
  global messages
  if request.method == "DELETE": 
    table.put_item(
      Item = {
        "username": username,
        "messages": []
      }
    )
    messages = [*def_messages]
    return jsonify({"res": "ok"}) 
  
  more = table.get_item(
    Key = {
      "username": username
    }
  )
  if "Item" in more:
    more = more["Item"]["messages"]
    messages.extend(more)
  else:
    more = []
    res = table.put_item(
      Item = {
        "username": username,
        "messages": []
      }
    )
    print(res)
  return jsonify({"messages": more})


@app.route('/', methods=['POST'])
def send_message():
  got = json.loads(request.data)
  msg = got["msg"]
  username = got["user"]
  to_add = []
  to_add.append({"role": "user", "content": msg})
  completion = client.chat.completions.create(model = "gpt-3.5-turbo", messages = messages + to_add, temperature = 1)
  res = completion.choices[0].message.content
  #time.sleep(1)
  #res = "hi!"
  to_add.append({"role": "assistant", "content": res})
  table.update_item(
    Key = {
      "username": username
    },
    UpdateExpression="SET messages = list_append(messages, :msg)", 
    ExpressionAttributeValues={
        ':msg': to_add
    },
    ReturnValues="UPDATED_NEW"
  )
  messages.extend(to_add)
  return jsonify({"content" : res})

if __name__ == "__main__":
    app.run(port=3001)

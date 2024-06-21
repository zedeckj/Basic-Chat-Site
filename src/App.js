import logo from './logo.svg';
import './App.css';
import { useState, useEffect} from "react";


const DEF_CLASS = "font-mono text-white"
const SIGNIN_CLASS = "grid text-center my-10 place-items-center"
const TYPE_CLASS = "fixed bottom-0 left-0 w-full h-16 bg-zinc-700 flex justify-center items-center"
const BUTTON_CLASS = "rounded-lg p-1 px-1 my-2 bg-zinc-400"
const TEXTAREA_CLASS = "text-black resize-none w-96 bg-zinc-200 rounded-lg m-2 p-1"

function textBubble(type) {
  let color = "bg-yellow-600"
  if (type == "user") {
    color = "bg-blue-600"
  }
  else if (type == "assistant") {
    color = "bg-zinc-600"
  }
  else if (type == "error") {
    color = "bg-red-600"
  }
  return "font-mono text-white p-1 my-2 rounded-lg mr-4 " + color 
}

function makeRole(role, username) {
  if (role == "user") {
    return username
  } else {
    return "chatbot"
  }
}


function sendMessageBuilder(setLoading, setChatLog, setError, user) {
  return async (e) => {
    e.preventDefault()
    const msg = e.target.text.value
    setChatLog((prevLog) => [...prevLog, {"role": "user", "content": msg, "id": prevLog.length}])
    setLoading(true) 
    if (msg) {
      const raw = await fetch("http://localhost:3001/", {
        method: "POST",
        body: JSON.stringify({user, msg})
      })
      if (raw.ok) {
        const res = await raw.json()
        setChatLog((prevLog) => [...prevLog, {"role": "assistant", "content": res.content, "id": prevLog.length}]) 
      } else {
        setError(true)
        setChatLog((prevLog) => [...prevLog, {"role": "error", "content": raw.status + " - " + raw.statusText}])
        
      }      
    }
    setLoading(false)
  }
}


function signInBuilder(setUsername, setLoading, setChatLog) {
  return async (e) => {
    e.preventDefault()
    setLoading(true)
    const user = e.target.user.value
    const raw = await fetch("http://localhost:3001/fetch/" + user)
    if (raw.ok) {
      const res = await raw.json()
      setChatLog(res.messages)
      setUsername(user)
      setLoading(false)
    }
  }
}

function clearBuilder(user, setLoading, setChatLog) {
  return async (e) => {
    e.preventDefault()
    setLoading(true)
    const raw = await fetch("http://localhost:3001/fetch/" + user, {
      method: "DELETE"
    })
    setChatLog([])
    setLoading(false)
  }
}

function App() {
  const [chatLog, setChatLog] = useState([])
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const sendMessage = sendMessageBuilder(setLoading, setChatLog, setError, username)
  const signIn = signInBuilder(setUsername, setLoading, setChatLog)
  const clear = clearBuilder(username, setLoading, setChatLog)
  return (<div className = {DEF_CLASS}>
    {username == "" ?
    <div className = {SIGNIN_CLASS}>
      <form onSubmit = {signIn}>
        <div>
          <p>Enter Username</p>
          <input type = "text" name = "user" className = "text-black"/>
          <br /> 
          <button type = "submit" className = {BUTTON_CLASS}>Sign In</button>
        </div>
      </form>
    </div> :
    <div>
      <ul>
        {chatLog.map((chat) => {
          return (
            <li key = {chat.id} className = {textBubble(chat.role)}>
              <p>{makeRole(chat.role, username)}: {chat.content}</p>
            </li>)
        })}
      </ul>
      {loading && <p className = {textBubble("bg-zinc-600")}>...</p>}
      <div className = {TYPE_CLASS}> 
        <form onSubmit = {clear}>
          <button className = {BUTTON_CLASS + ' h-14 w-20 '} type = "submit">Reset</button>
        </form>
        <form onSubmit = {sendMessage}>
          <div className = "flex">
            <textarea className = {TEXTAREA_CLASS} name = "text" autoComplete = "off" type = "text" />
            <button className = {BUTTON_CLASS + " w-20"} type = "submit" disabled = {loading || error}>Submit</button>
          </div>
        </form>

      </div>
    </div>}
  </div>);
}

export default App;

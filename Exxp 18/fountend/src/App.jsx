import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

export default function App() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [joined, setJoined] = useState(false); // new state

  useEffect(() => {
    socket.on("chat", (data) => setChat((prev) => [...prev, data]));
    return () => socket.off("chat");
  }, []);

  const sendMsg = (e) => {
    e.preventDefault();
    if (name && msg) {
      socket.emit("chat", { name, msg });
      setMsg("");
    }
  };

  return (
    <div className="container">
      <h2> Simple Chat</h2>

      {!joined ? (
        <div className="join-box">
          <input
            className="input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" onClick={() => name && setJoined(true)}>
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <div className="chat-box">
            {chat.map((c, i) => (
              <p key={i}>
                <b>{c.name}:</b> {c.msg}
              </p>
            ))}
          </div>

          <form onSubmit={sendMsg} className="form">
            <input
              className="input"
              placeholder="Type a message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <button className="btn">Send</button>
          </form>
        </>
      )}
    </div>
  );
}

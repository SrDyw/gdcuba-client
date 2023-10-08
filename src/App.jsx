import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { log } from "./debug/main.debug";

const socket = io("https://gdcuba-api.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [activesGroups, setActiveGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(-1);
  const [hasPremision, setHasPermision] = useState(false);
  const id = socket.id;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!hasPremision) {
      alert("The server is full, can't connect");
      return;
    }

    if (currentGroup != -1) {
      const form = new FormData(e.target);
      const data = Object.fromEntries(form);

      const message = {
        message: data.in_text,
        user: socket.id,
        id: socket.id,
        targetGroup: currentGroup,
      };

      socket.emit("message", message);

      reciveMessage(message);
    } else {
      alert("You are not in any group");
    }
  };

  useEffect(() => {
    socket.on("message", reciveMessage);
    socket.on("groupSw", reciveGroupRequest);
    socket.on("generalInfoUpdate", reciveGeneralInfo);

    return () => {
      socket.off("message", reciveMessage);
      socket.off("groupSw", reciveGroupRequest);
      socket.off("generalInfoUpdate", reciveGeneralInfo);
    };
  }, []);

  useEffect(() => {
    log(activesGroups);
  }, [activesGroups]);

  const reciveGeneralInfo = info => {
    setHasPermision(true);
    setActiveGroups(info.groups);
  }

  const reciveMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const reciveGroupRequest = (requestInfo) => {
    log(requestInfo);
    if (requestInfo.code == 1) {
      setCurrentGroup(requestInfo.targetGroup);
    }
  };


  const changeGroup = (group) => {
    if (!hasPremision) {
      alert("The server is full, can't connect");
      return;
    }
    socket.emit("groupSw", {
      targetGroup: group,
      currentGroup: currentGroup,
    });
  };

  return (
    <>
      <div
        className="active_group"
        style={{ position: "fixed", top: "0", right: "0", marginRight: "10px" }}
      >
        <ul>
          {
            activesGroups.map((group, key) => (
              <li onClick={() => changeGroup(key)} key={key}>
                <h2>{group}</h2>
              </li>
            ))
          }
        </ul>
      </div>
      <div className="message_container">
        <ul>
          {messages.map((message, key) => (
            <li key={key}>
              <h4 style={{ color: `${message.id == id ? "green" : "white"}` }}>
                {message.user.slice(0, 5)}
              </h4>
              <p>{message.message}</p>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="in_text" id="" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

export default App;

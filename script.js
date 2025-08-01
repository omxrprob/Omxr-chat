// Generate persistent ID
if (!localStorage.getItem("userID")) {
  const id = "#USER-" + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem("userID", id);
}
const userID = localStorage.getItem("userID");

// Chat logic
if (location.pathname.includes("chat.html")) {
  const ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", id: userID }));
  };

  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    const messages = document.getElementById("messages");
    const p = document.createElement("p");
    p.innerText = `${msg.from}: ${msg.text}`;
    messages.appendChild(p);
  };

  window.sendMessage = function () {
    const text = document.getElementById("msg").value;
    if (text.startsWith("/")) {
      ws.send(JSON.stringify({ type: "command", from: userID, text }));
    } else {
      ws.send(JSON.stringify({ type: "msg", from: userID, text }));
    }
    document.getElementById("msg").value = "";
  };
}

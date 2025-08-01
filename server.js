const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

const mods = ['#OMXR-0001'];
let clients = [];

wss.on("connection", socket => {
  let clientID = null;

  socket.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "join") {
      clientID = data.id;
      clients.push({ id: clientID, socket });
      console.log(`${clientID} joined`);
    }

    if (data.type === "msg") {
      clients.forEach(c => {
        c.socket.send(JSON.stringify({ from: data.from, text: data.text }));
      });
    }

    if (data.type === "command" && mods.includes(data.from)) {
      const parts = data.text.split(" ");
      const cmd = parts[0];
      const targetID = parts[1];

      const target = clients.find(c => c.id === targetID);

      if (cmd === "/kick" && target) {
        target.socket.send(JSON.stringify({ from: "SYSTEM", text: "You were kicked." }));
        target.socket.close();
      }

      if (cmd === "/clear") {
        clients.forEach(c =>
          c.socket.send(JSON.stringify({ from: "SYSTEM", text: "[Chat cleared by mod]" }))
        );
      }

      if (cmd === "/ban" && target) {
        // No actual banlist yet, lol
        target.socket.send(JSON.stringify({ from: "SYSTEM", text: "Pretend you're banned 💀" }));
      }
    }

    // WebRTC signaling pass-through
    if (["offer", "answer", "candidate"].includes(data.type)) {
      clients.forEach(c => {
        if (c.socket !== socket) c.socket.send(msg);
      });
    }
  });

  socket.on("close", () => {
    clients = clients.filter(c => c.socket !== socket);
    console.log(`${clientID} disconnected`);
  });
});

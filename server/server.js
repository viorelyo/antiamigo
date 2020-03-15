const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io").listen(server);

var players = {};
const sprites = ["dude", "frog", "pink", "guy"];
const positions = [
  { x: 250, y: 50 },
  { x: 400, y: 50 },
  { x: 250, y: 200 },
  { x: 400, y: 200 }
];

const client = "client";

app.use(express.static(client));

app.get("*", function(req, res) {
  res.sendFile(path.resolve(client, "index.html"));
});

io.on("connection", socket => {
  playerJoined(socket);
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("startGame", () => {
    console.log("Game Started");
    io.emit("gameStarting");
  });

  socket.on("playerMovement", movementData => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].direction = movementData.direction;
      socket.broadcast.emit("playerMoved", players[socket.id]);
    }
  });

  socket.on("playerKilled", data => {
    console.log("Player killed: " + data.victimID + " by: " + data.killerID);
    playerLeft(data.victimID);
    io.emit("opponentDied", data);
  });

  socket.on("disconnect", () => {
    playerLeft(socket.id);
    console.log("Player disconnected: " + socket.id);
    io.emit("disconnect", socket.id);
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});

function playerJoined(socket) {
  const randomInt = Math.floor(Math.random() * 4);

  players[socket.id] = {
    x: positions[randomInt].x,
    y: positions[randomInt].y,
    direction: "idle-right",
    spriteKey: sprites[randomInt],
    playerID: socket.id
  };
  console.log("Player joined lobby: " + socket.id);
}

function playerLeft(socketID) {
  delete players[socketID];
}

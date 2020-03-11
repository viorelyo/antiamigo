const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io").listen(server);

var players = {};
const sprites = ["dude", "frog", "pink", "guy"];

const client = "client";

app.use(express.static(client));

app.get("*", function(req, res) {
  res.sendFile(path.resolve(client, "index.html"));
});

io.on("connection", socket => {
  console.log("Player connected: " + socket.id);
  playerJoined(socket);
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("playerMovement", movementData => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].direction = movementData.direction;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  })

  socket.on("playerKilled", playerID => {
    console.log("Player killed: " + playerID);
    playerLeft(playerID);
    socket.broadcast.emit("playerDead", playerID);
  })

  socket.on("disconnect", () => {
    console.log("Player disconnected: " + socket.id);
    playerLeft(socket.id);
    io.emit("disconnect", socket.id);
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});

function playerJoined(socket) {
  const randomInt = Math.floor(Math.random() * 4);

  players[socket.id] = {
    x: 250,
    y: 50,
    direction: "idle-right",
    spriteKey: sprites[randomInt],
    playerID: socket.id
  };
  console.log(players);
}

function playerLeft(socketID) {
  delete players[socketID];
  console.log(players);
}

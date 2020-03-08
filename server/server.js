const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io").listen(server);

var players = {};

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

  socket.on("disconnect", () => {
    console.log("Player disconnected: " + socket.id);
    playerLeft(socket);
    io.emit("disconnect, socket.id");
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});

function playerJoined(socket) {
  players[socket.id] = {
    x: 100,
    y: 100,
    playerID: socket.id
  };
  console.log(players);
}

function playerLeft(socket) {
  delete players[socket.id];
  console.log(players);
}

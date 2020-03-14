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
  playerJoined(socket);
  socket.emit("currentPlayers", players);

  socket.on("gameJoined", () => {
    console.log("GameJoined: " + socket.id);
    socket.broadcast.emit("newPlayer", players[socket.id]);
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
    //TODO raise points for killerID
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
    x: 250,
    y: 50,
    direction: "idle-right",
    spriteKey: sprites[randomInt],
    playerID: socket.id
  };
  console.log("Player joined: " + socket.id);
}

function playerLeft(socketID) {
  delete players[socketID];
}

const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io").listen(server);

var runningGame = {
  gameIsRunning: false,
  activePlayers: []
};

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
  if (runningGame.gameIsRunning) {
    socket.emit("currentPlayers", {
      players: {},
      gameIsRunning: runningGame.gameIsRunning
    });
  } else {
    socket.emit("currentPlayers", {
      players: players,
      gameIsRunning: runningGame.gameIsRunning
    });
    socket.broadcast.emit("newPlayer", players[socket.id]);
  }

  socket.on("startGame", () => {
    runGame();
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
    // playerLeft(data.victimID);
    io.emit("playerDied", data);
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

function runGame() {
  for (const [key, value] of Object.entries(players)) {
    runningGame.activePlayers.push(key);
  }

  runningGame.gameIsRunning = true;
  console.log("Game started");
}

function playerLeft(socketID) {
  const index = runningGame.activePlayers.indexOf(players[socketID].playerID);
  if (index > -1) {
    runningGame.activePlayers.splice(index, 1);
  }
  delete players[socketID];

  if (runningGame.activePlayers.length === 0) {
    runningGame.gameIsRunning = false;
    io.emit("gameIsAvailable", {
      players: players,
      gameIsRunning: runningGame.gameIsRunning
    });
  }
}

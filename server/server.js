const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io").listen(server);

var players = {};
const sprites = ["dude", "frog", "pink", "guy"];
const startPositions = [
  { x: 250, y: 50 },
  { x: 300, y: 300 },
  { x: 700, y: 50 },
  { x: 400, y: 200 }
];

var runningGame = {
  gameIsRunning: false,
  activePlayers: {},
  positions: [],
  availableSprites: []
};
Object.assign(runningGame.positions, startPositions);
Object.assign(runningGame.availableSprites, sprites);

const clientFolder = "client";

app.use(express.static(clientFolder));

app.get("*", function(req, res) {
  res.sendFile(path.resolve(clientFolder, "index.html"));
});

io.on("connection", socket => {
  playerJoined(socket);

  if (runningGame.gameIsRunning || Object.keys(players).length > 4) {
    socket.emit("currentPlayers", {
      players: {},
      gameIsRunning: runningGame.gameIsRunning
    });
  } else {
    assignDataToPlayer(socket.id);
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
    if (runningGame.activePlayers[socket.id]) {
      runningGame.activePlayers[socket.id].x = movementData.x;
      runningGame.activePlayers[socket.id].y = movementData.y;
      runningGame.activePlayers[socket.id].direction = movementData.direction;
      socket.broadcast.emit(
        "playerMoved",
        runningGame.activePlayers[socket.id]
      );
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
    console.log();
    io.emit("disconnect", socket.id);
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});

function playerJoined(socket) {
  players[socket.id] = {
    playerID: socket.id,
    direction: "idle-right"
  };

  // console.log("Active: ", players);
  console.log("Player joined lobby: " + socket.id);
}

function runGame() {
  playerCount = 0;
  for (const [key, value] of Object.entries(players)) {
    runningGame.activePlayers[key] = value;
    playerCount++;
    delete players[key];
    if (playerCount === 4) {
      break; //Game limit achieved
    }
  }

  runningGame.gameIsRunning = true;
  console.log("Game started");
}

function playerLeft(socketID) {
  if (!runningGame.gameIsRunning) {
    runningGame.availableSprites.push(players[socketID].spriteKey);
    runningGame.positions.push({
      x: players[socketID].x,
      y: players[socketID].y
    });

    delete players[socketID];
  } else {
    delete runningGame.activePlayers[socketID];

    if (Object.keys(runningGame.activePlayers).length === 0) {
      restartGame();
      io.emit("gameIsAvailable", {
        players: players,
        gameIsRunning: runningGame.gameIsRunning
      });
    }
  }
}

function assignDataToPlayer(playerID) {
  const randomInt = Math.floor(
    Math.random() * runningGame.availableSprites.length
  );

  players[playerID].x = runningGame.positions[randomInt].x;
  players[playerID].y = runningGame.positions[randomInt].y;
  players[playerID].spriteKey = runningGame.availableSprites[randomInt];

  runningGame.positions.splice(randomInt, 1);
  runningGame.availableSprites.splice(randomInt, 1);
}

function restartGame() {
  runningGame.gameIsRunning = false;
  runningGame.activePlayers = {};
  Object.assign(runningGame.positions, startPositions);
  Object.assign(runningGame.availableSprites, sprites);

  // assign availableSprite && position to waiting players
  for (const [playerID, value] of Object.entries(players)) {
    assignDataToPlayer(playerID);
  }
}

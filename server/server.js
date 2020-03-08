const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io").listen(server);

const client = "client";

app.use(express.static(client));

app.get("*", function(req, res) {
  res.sendFile(path.resolve(client, "index.html"));
});

io.on("connection", socket => {
  console.log("User connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});

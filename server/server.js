const express = require("express");
const app = express();
const server = require("http").Server(app);
const path = require("path");

const client = "client";

app.use(express.static(client));

app.get("*", function(req, res) {
  res.sendFile(path.resolve(client, "index.html"));
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});

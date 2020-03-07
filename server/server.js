var express = require("express");
var app = express();
var server = require("http").Server(app);
const path = require("path");

const client = "client";

app.use(express.static(__dirname + "/" + client));

app.get("/", function(req, res) {
  res.sendFile(path.resolve(__dirname, "../", client, "index.html"));
});

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});

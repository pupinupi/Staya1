import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const rooms = {};

io.on("connection", socket => {

  console.log("Игрок подключился");

  socket.on("createRoom", ({ roomCode, player }) => {

    rooms[roomCode] = {
      players: [player]
    };

    socket.join(roomCode);

    io.to(roomCode).emit(
      "playersUpdate",
      rooms[roomCode].players
    );
  });

  socket.on("joinRoom", ({ roomCode, player }) => {

    if (!rooms[roomCode]) return;

    rooms[roomCode].players.push(player);

    socket.join(roomCode);

    io.to(roomCode).emit(
      "playersUpdate",
      rooms[roomCode].players
    );
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server started");
});

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
    players: [player],
    currentTurn: 0
  };

  socket.join(roomCode);

io.to(roomCode).emit(
    "playersUpdate",
    rooms[roomCode].players
  );

}); 
  io.to(roomCode).emit(
  "turnUpdate",
  rooms[roomCode].players[0].name
);

  socket.on("joinRoom", ({ roomCode, player }) => {
console.log("JOIN ROOM");
console.log(roomCode);
console.log(player);
console.log(rooms);
    if (!rooms[roomCode]) return;

    const exists =
      rooms[roomCode].players.find(
        p => p.name === player.name
      );

    if(!exists){
      rooms[roomCode].players.push(player);
    }

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

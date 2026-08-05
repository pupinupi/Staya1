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

io.on("connection", (socket) => {

  console.log("Игрок подключился:", socket.id);

  // Создание комнаты
  socket.on("createRoom", ({ roomCode, player }) => {

    if (!roomCode || !player) return;

    if (rooms[roomCode]) {
      socket.emit("errorMessage", "Комната уже существует");
      return;
    }

    rooms[roomCode] = {
      players: [player],
      currentTurn: 0
    };

    socket.join(roomCode);

    io.to(roomCode).emit(
      "playersUpdate",
      rooms[roomCode].players
    );

    io.to(roomCode).emit(
      "turnUpdate",
      rooms[roomCode].players[0].name
    );

    console.log("Комната создана:", roomCode);

  });


  // Подключение к комнате
  socket.on("joinRoom", ({ roomCode, player }) => {

    console.log("JOIN ROOM");
    console.log(roomCode);
    console.log(player);

    if (!rooms[roomCode]) {
      socket.emit("errorMessage", "Комната не найдена");
      return;
    }

    const exists = rooms[roomCode].players.find(
      (p) => p.name === player.name
    );

    if (!exists) {
      rooms[roomCode].players.push(player);
    }

    socket.join(roomCode);

    io.to(roomCode).emit(
      "playersUpdate",
      rooms[roomCode].players
    );

    io.to(roomCode).emit(
      "turnUpdate",
      rooms[roomCode].players[
        rooms[roomCode].currentTurn
      ].name
    );

    console.log(
      "Игрок вошёл в комнату:",
      player.name,
      roomCode
    );

  });


  // Отключение игрока
  socket.on("disconnect", () => {
    console.log("Игрок отключился:", socket.id);
  });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});

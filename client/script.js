import { boardCoordinates } from "./Data/boardCoordinates.js";

const socket = io();

const diceSound = new Audio("./assets/sounds/dice.mp3");
const followersSound = new Audio("./assets/sounds/followers.mp3");
const viralSound = new Audio("./assets/sounds/viral.mp3");
const winSound = new Audio("./assets/sounds/win.mp3");

diceSound.volume = 0.5;
followersSound.volume = 0.5;
viralSound.volume = 0.6;
winSound.volume = 0.8;

let currentToken = "🕷";
let playerName = "";
let roomCode = "";
let roomPlayers = [];

let position = 1;
let followers = 0;
let currentTurnPlayer = "";

const token = document.getElementById("player");
const rollBtn = document.getElementById("rollBtn");
const turnInfo = document.getElementById("turnInfo");
const cellGlow = document.getElementById("cellGlow");

window.selectToken = function(tokenEmoji){

  currentToken = tokenEmoji;

  document
    .querySelectorAll(".token-btn")
    .forEach(btn => {
      btn.classList.remove("selected-token");
    });

  document
    .querySelector(`[data-token="${tokenEmoji}"]`)
    .classList.add("selected-token");

};

document
  .getElementById("startGameBtn")
  .addEventListener("click", () => {

    playerName =
  document.getElementById("playerName")
  .value
  .trim();

if(playerName === ""){

  alert("Введите ник");
  return;

}

    document.getElementById("lobby")
      .style.display = "none";

    document.getElementById("gameScreen")
      .style.display = "block";

    token.innerText = currentToken;

    movePlayer(position);

  });

movePlayer(position);
updateFollowers();

rollBtn.addEventListener("click", async () => {

  rollBtn.disabled = true;

  turnInfo.innerText =
    "⏳ Ход выполняется...";
  diceSound.currentTime = 0;
  diceSound.play();

  const diceView =
    document.getElementById("diceResult");

  for(let i = 0; i < 10; i++){

    diceView.innerText =
      "🎲 " + (Math.floor(Math.random()*6)+1);

    await new Promise(r =>
      setTimeout(r,80)
    );

  }

  const dice =
    Math.floor(Math.random()*6)+1;

  diceView.innerText =
    "🎲 Выпало: " + dice;

  const oldPosition = position;

await animateMove(dice);

if(oldPosition + dice > 20){

  followers += 500;

  showCard(
    "🏁 Новый круг",
    "+500 подписчиков за полный круг"
  );

}

handleCell(position);

turnInfo.innerText =
  "🎲 Ваш ход";

rollBtn.disabled = false;

});
function movePlayer(pos){

  const cell = boardCoordinates[pos];

  if(!cell){
    console.log("Нет координат:", pos);
    return;
  }

  cellGlow.style.left =
    (cell.x - 30) + "px";

  cellGlow.style.top =
    (cell.y - 30) + "px";

  token.style.left =
    (cell.x - 15) + "px";

  token.style.top =
    (cell.y - 25) + "px";

}
async function animateMove(steps){

  for(let i = 0; i < steps; i++){

    position++;

    if(position > 20){
      position = 1;
    }

    movePlayer(position);

    await new Promise(r =>
      setTimeout(r,180)
    );

  }

}
function handleCell(pos){

  switch(pos){

    case 1:
      followers += 1000;
      showCard(
        "🚀 Старт",
        "+1000 подписчиков"
      );
      break;

    case 2:
case 4:
case 5:
case 7:
case 8:
case 9:
case 11:
case 13:
case 14:
case 16:
case 18:

  followersSound.currentTime = 0;
  followersSound.play();

  followers += 500;

      showCard(
        "📷 Стрим",
        "+500 подписчиков"
      );
      break;

    case 3:
      flash("#c700ff");
      followers += 25000;
      showCard(
        "🎬 Клип",
        "Твой Reels залетел в рекомендации. +25000 подписчиков"
      );
      break;

    case 6:
      followers -= 10000;
      showCard(
        "💀 Отмена",
        "Чат не понял шутку. -10000 подписчиков"
      );
      break;

    case 10:
      flash("#00e5ff");

  viralSound.currentTime = 0;
  viralSound.play();

  followers += 100000;
      showCard(
        "🔥 Вирус",
        "Видео стало вирусным. +100000 подписчиков"
      );
      break;

    case 12:
      followers += 10000;
      showCard(
        "🍔 За едой",
        "Удачный перекус на стриме. +10000 подписчиков"
      );
      break;

    case 15:
      followers += 25000;
      showCard(
        "🐺 Коллаб",
        "Совместный стрим принёс +25000 подписчиков"
      );
      break;

    case 17:
      followers -= 20000;
      showCard(
        "🤡 Кринж",
        "Неудачный момент попал в нарезки. -20000 подписчиков"
      );
      break;

    case 19:
      followers += 20000;
      showCard(
        "🎁 Донат",
        "Щедрый донат-марафон. +20000 подписчиков"
      );
      break;

    case 20:
      flash("#ffd700");

  viralSound.currentTime = 0;
  viralSound.play();

  followers += 150000;
      showCard(
        "⭐ Джекпот",
        "Ты попал во все рекомендации. +150000 подписчиков"
      );
      break;
  }

  if(followers < 0){
    followers = 0;
  }

  updateFollowers();
  checkWin();

}

function updateFollowers(){

  document.getElementById("followers").innerText =
    "Подписчики: " +
    followers.toLocaleString("ru-RU");

  const percent =
    Math.min(
      (followers / 1000000) * 100,
      100
    );

  document.getElementById("progressBar")
    .style.width = percent + "%";

  let icon = "🔥";

  if(percent >= 50){
    icon = "🚀";
  }

  if(percent >= 100){
    icon = "👑";
  }

  document.getElementById("progressText")
    .innerText =
    icon + " " + Math.floor(percent) + "%";

}

function showCard(title,text){

  document.getElementById("cardTitle").innerText =
    title;

  document.getElementById("cardText").innerText =
    text;

  document.getElementById("eventCard")
    .classList.remove("hidden");

}

window.closeCard = function(){

  document.getElementById("eventCard")
    .classList.add("hidden");

};

function checkWin(){

  if(followers >= 1000000){

    rollBtn.disabled = true;

    winSound.currentTime = 0;
    winSound.play();

    document
      .getElementById("progressBar")
      .classList.add("progress-win");

    setTimeout(() => {

      document
        .getElementById("winScreen")
        .classList.add("show");

    },1500);

  }

}

window.restartGame = function(){

  location.reload();

};

window.addEventListener("load", () => {

  const defaultToken =
    document.querySelector('[data-token="🕷"]');

  if(defaultToken){

    defaultToken.classList.add(
      "selected-token"
    );

  }

});

function flash(color){

  const flash =
    document.getElementById("flashEffect");

  flash.style.background = color;

  flash.style.left = token.style.left;
  flash.style.top = token.style.top;

  flash.classList.remove("active");

  void flash.offsetWidth;

  flash.classList.add("active");

}

// ==========================
// КОМНАТЫ
// ==========================

document
  .getElementById("createRoomBtn")
  .addEventListener("click", () => {

    playerName =
      document.getElementById("playerName")
      .value
      .trim();

    if(!playerName){
      alert("Введите ник");
      return;
    }

    roomCode =
      Math.random()
      .toString(36)
      .substring(2,8)
      .toUpperCase();

    document.getElementById("roomCode").value =
      roomCode;

    document.getElementById("roomInfo").innerHTML =
      "Комната: " + roomCode;

    roomPlayers = [{
      name: playerName,
      token: currentToken,
      position: 1
    }];

    updatePlayersList();
    renderPlayers(roomPlayers);

    socket.emit("createRoom", {
      roomCode,
      player: {
        name: playerName,
        token: currentToken,
        position: 1
      }
    });

});

document
  .getElementById("joinRoomBtn")
  .addEventListener("click", () => {

    const code =
      document
      .getElementById("roomCode")
      .value
      .trim()
      .toUpperCase();

    playerName =
      document
      .getElementById("playerName")
      .value
      .trim();

    if(!playerName){
      alert("Введите ник");
      return;
    }

    socket.emit("joinRoom", {
      roomCode: code,
      player: {
        name: playerName,
        token: currentToken,
        position: 1
      }
    });

});

// ==========================
// СПИСОК ИГРОКОВ
// ==========================

function updatePlayersList(){

  const list =
    document.getElementById("playersList");

  if(!list) return;

  list.innerHTML = "";

  roomPlayers.forEach(player => {

    const row =
      document.createElement("div");

    row.className =
      "player-row";

    row.innerText =
      `${player.token} ${player.name}`;

    list.appendChild(row);

  });

}

// ==========================
// ФИШКИ НА ПОЛЕ
// ==========================

function renderPlayers(players){

  const layer =
    document.getElementById("playersLayer");

  if(!layer) return;

  layer.innerHTML = "";

  players.forEach((player,index) => {

    const cell =
      boardCoordinates[player.position || 1];

    if(!cell) return;

    const playerToken =
      document.createElement("div");

    playerToken.className =
      "player-token";

    playerToken.innerText =
      player.token;

    playerToken.style.left =
      (cell.x - 15 + index * 15) + "px";

    playerToken.style.top =
      (cell.y - 25 + index * 15) + "px";

    layer.appendChild(playerToken);

  });

}

// ==========================
// SOCKET EVENTS
// ==========================

socket.on("playersUpdate", players => {

  roomPlayers = players;

  updatePlayersList();

  renderPlayers(players);

});

socket.on("turnUpdate", playerNameTurn => {

  currentTurnPlayer = playerNameTurn;

  if(playerNameTurn === playerName){

    turnInfo.innerText =
      "🎲 Ваш ход";

    rollBtn.disabled = false;

  }else{

    turnInfo.innerText =
      "⏳ Ход игрока: " +
      playerNameTurn;

    rollBtn.disabled = true;

  }

});

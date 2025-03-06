import Ship from "./ship";

// dom elements
const playerBoard = document.getElementById("player-board");
const computeBoard = document.getElementById("computer-board");
const statusMessage = document.getElementById("status-message");

// create 10 x 10 baord
const renderBoard = (boardElement) => {
  boardElement.innerHTML = "";
  for (let row = 0; row < 10; row++) {
    for (let column = 0; column < 10; column++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = column;
    }
  }
};

renderBoard(playerBoard)
renderBoard(computeBoard)


// create ship and place on baord


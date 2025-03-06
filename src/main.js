import Ship from "./ship.js";
import Gameboard from "./gameboard.js";
import Player from "./player.js";

// DOM elements
const playerBoardElement = document.getElementById("player-board");
const computerBoardElement = document.getElementById("computer-board");
const statusMessage = document.getElementById("status-message");

// Create players
const humanPlayer = Player(false); // Human player
const computerPlayer = Player(true); // Computer player

// Track previous attacks to avoid duplicates
const previousHumanAttacks = [];
const previousComputerAttacks = [];

// Create 10 x 10 board
const renderBoard = (boardElement, gameboard, hideShips = false) => {
  boardElement.innerHTML = "";
  const board = gameboard.getBoard();
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      // Add ship class if there's a ship at this position and not hiding ships
      if (board[row][col] !== null && !hideShips) {
        cell.classList.add('ship');
      }
      
      boardElement.appendChild(cell);
    }
  }
};

// Initial board rendering
renderBoard(playerBoardElement, humanPlayer.gameboard);
renderBoard(computerBoardElement, computerPlayer.gameboard, true); // Hide computer ships

// Place ships on the player's board
const placePlayerShip = (length, row, col, isHorizontal) => {
  // place the ship on the gameboard
  const success = humanPlayer.gameboard.placeShip(length, row, col, isHorizontal);
  
  if (success) {
    // Re-render the board to show the ship
    renderBoard(playerBoardElement, humanPlayer.gameboard);
    return true;
  }
  
  return false;
};

// Place some example ships for the human player
placePlayerShip(5, 0, 0, true);
placePlayerShip(4, 2, 3, true);
placePlayerShip(3, 4, 5, false);
placePlayerShip(3, 6, 1, true);
placePlayerShip(2, 8, 7, true);

// Place ships randomly for the computer
computerPlayer.placeShipsRandomly([5, 4, 3, 3, 2]);

// Handle player attacks on computer board
computerBoardElement.addEventListener('click', (e) => {
  if (e.target.classList.contains('cell')) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Check if this cell has already been attacked
    if (e.target.classList.contains('hit') || e.target.classList.contains('miss')) {
      return;
    }
    
    // Add to previous attacks
    previousHumanAttacks.push({ row, col });
    
    // Process the attack
    const isHit = humanPlayer.attack(computerPlayer.gameboard, row, col);
    
    if (isHit) {
      e.target.classList.add('hit');
      statusMessage.textContent = 'Hit!';
    } else {
      e.target.classList.add('miss');
      statusMessage.textContent = 'Miss!';
    }
    
    // Check if all ships are sunk
    if (computerPlayer.gameboard.allShipsSunk()) {
      statusMessage.textContent = 'You win! All enemy ships are sunk!';
      return; // Game over
    }
    
    // Computer's turn to attack
    setTimeout(computerTurn, 500);
  }
});

// Handle computer attacks on player board
const computerTurn = () => {
  // Computer makes a random attack
  const attack = computerPlayer.makeRandomAttack(humanPlayer.gameboard, previousComputerAttacks);
  previousComputerAttacks.push({ row: attack.row, col: attack.col });
  
  // Update the UI
  const cell = playerBoardElement.querySelector(`[data-row="${attack.row}"][data-col="${attack.col}"]`);
  
  if (attack.hit) {
    cell.classList.add('hit');
    statusMessage.textContent = 'Computer hit your ship!';
  } else {
    cell.classList.add('miss');
    statusMessage.textContent = 'Computer missed!';
  }
  
  // Check if all player ships are sunk
  if (humanPlayer.gameboard.allShipsSunk()) {
    statusMessage.textContent = 'Computer wins! All your ships are sunk!';
  }
};

// For demonstration: Export factories to make them accessible in the browser console
window.Ship = Ship;
window.Gameboard = Gameboard;
window.Player = Player;
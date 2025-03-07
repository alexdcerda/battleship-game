import Game from './game.js';
import { setupDragAndDrop, setupRandomPlacement } from './dragdrop.js';
import './style.css';

// DOM elements
const playerBoardElement = document.getElementById('player-board');
const playerBoardBattleElement = document.getElementById('player-board-battle');
const computerBoardElement = document.getElementById('computer-board');
const statusMessage = document.getElementById('status-message');
const shipContainer = document.getElementById('ship-container');
const startGameBtn = document.getElementById('start-game-btn');
const randomPlacementBtn = document.getElementById('random-placement-btn');
const resetBtn = document.getElementById('reset-btn');
const gamePhaseElements = {
  setup: document.getElementById('setup-phase'),
  battle: document.getElementById('battle-phase'),
  gameOver: document.getElementById('game-over')
};

// Create game instance
const game = new Game();

// Create 10 x 10 board
const renderBoard = (boardElement, gameboard, hideShips = false) => {
  boardElement.innerHTML = '';
  const board = gameboard.getBoard();
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
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

// Show the appropriate game phase UI
const updateGamePhaseUI = (phase) => {
  Object.keys(gamePhaseElements).forEach(key => {
    if (gamePhaseElements[key]) {
      gamePhaseElements[key].style.display = key === phase ? 'block' : 'none';
    }
  });
};

// Initialize boards
renderBoard(playerBoardElement, game.humanPlayer.gameboard);
renderBoard(computerBoardElement, game.computerPlayer.gameboard, true);

// Setup drag and drop for ship placement
setupDragAndDrop(game, shipContainer, playerBoardElement, renderBoard);

// Setup random placement button
setupRandomPlacement(game, shipContainer, playerBoardElement, renderBoard);

// Start game button event listener
startGameBtn.addEventListener('click', () => {
  const result = game.initializeGame();
  
  if (result.success) {
    // Render the battle boards
    renderBoard(playerBoardBattleElement, game.humanPlayer.gameboard);
    renderBoard(computerBoardElement, game.computerPlayer.gameboard, true);
    
    updateGamePhaseUI('battle');
    statusMessage.textContent = 'Game started! Click on the opponent\'s board to attack.';
  } else {
    statusMessage.textContent = result.message;
  }
});

// Reset button event listener
resetBtn.addEventListener('click', () => {
  // Create a new game
  window.location.reload();
});

// Handle player attacks on computer board
computerBoardElement.addEventListener('click', (e) => {
  if (game.getGameStatus() !== 'playing') return;
  
  if (e.target.classList.contains('cell')) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Process the attack
    const result = game.playerAttack(row, col);
    
    if (!result || !result.valid) {
      return;
    }
    
    if (result.hit) {
      e.target.classList.add('hit');
      statusMessage.textContent = 'Hit!';
    } else {
      e.target.classList.add('miss');
      statusMessage.textContent = 'Miss!';
    }
    
    // Check if game is over
    if (result.gameOver) {
      statusMessage.textContent = 'You win! All enemy ships are sunk!';
      document.getElementById('winner-message').textContent = 'Congratulations! You won!';
      updateGamePhaseUI('gameOver');
      return;
    }
    
    // Computer's turn to attack
    setTimeout(computerTurn, 500);
  }
});

// Handle computer attacks on player board
const computerTurn = () => {
  const result = game.computerAttack();
  
  if (!result) return;
  
  // Update the UI
  const cell = playerBoardBattleElement.querySelector(`[data-row="${result.row}"][data-col="${result.col}"]`);
  
  if (result.hit) {
    cell.classList.add('hit');
    statusMessage.textContent = 'Computer hit your ship!';
  } else {
    cell.classList.add('miss');
    statusMessage.textContent = 'Computer missed!';
  }
  
  // Check if game is over
  if (result.gameOver) {
    statusMessage.textContent = 'Computer wins! All your ships are sunk!';
    document.getElementById('winner-message').textContent = 'Computer won! Better luck next time.';
    updateGamePhaseUI('gameOver');
  }
};

// Show setup phase initially
updateGamePhaseUI('setup');
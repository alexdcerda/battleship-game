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
const resetBtn = document.getElementById('reset-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');
const gamePhaseElements = {
  setup: document.getElementById('setup-phase'),
  battle: document.getElementById('battle-phase'),
  gameOver: document.getElementById('game-over')
};

// Sound state
let soundEnabled = true;

// Sound toggle functionality
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  
  if (soundEnabled) {
    soundIcon.classList.remove('fa-volume-mute');
    soundIcon.classList.add('fa-volume-up');
  } else {
    soundIcon.classList.remove('fa-volume-up');
    soundIcon.classList.add('fa-volume-mute');
  }
});

// Sound effects
const sounds = {
  hit: document.getElementById('hit-sound'),
  miss: document.getElementById('miss-sound'),
  place: document.getElementById('place-sound'),
  victory: document.getElementById('victory-sound'),
  defeat: document.getElementById('defeat-sound')
};

// Play sound with better error handling and user interaction check
const playSound = (sound) => {
  // Don't play if sound is disabled
  if (!soundEnabled) return;
  
  // Check if sound exists and browser supports audio
  if (!sound || !sound.play) {
    console.log('Sound not available');
    return;
  }
  
  // Set volume and reset playback position
  sound.volume = 0.3;
  sound.currentTime = 0;
  
  // Play with error handling
  const playPromise = sound.play();
  
  // Modern browsers return a promise from play()
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // Playback started successfully
        console.log('Sound played successfully');
      })
      .catch(error => {
        // Auto-play was prevented or there was another error
        console.log('Sound play error:', error);
        
        // If it's an autoplay issue, we can try again after user interaction
        document.addEventListener('click', () => {
          // Try to play sound again after user interaction (one-time event)
          if (soundEnabled) {
            sound.play().catch(e => console.log('Still cannot play sound:', e));
          }
        }, { once: true });
      });
  }
};

// Create game instance
const game = new Game();

// Ship health tracking
const shipHealthStatus = {
  player: {
    carrier: { maxHealth: 5, currentHealth: 5 },
    battleship: { maxHealth: 4, currentHealth: 4 },
    cruiser: { maxHealth: 3, currentHealth: 3 },
    submarine: { maxHealth: 3, currentHealth: 3 },
    destroyer: { maxHealth: 2, currentHealth: 2 }
  },
  computer: {
    carrier: { maxHealth: 5, currentHealth: 5 },
    battleship: { maxHealth: 4, currentHealth: 4 },
    cruiser: { maxHealth: 3, currentHealth: 3 },
    submarine: { maxHealth: 3, currentHealth: 3 },
    destroyer: { maxHealth: 2, currentHealth: 2 }
  }
};

// Update ship health display
const updateShipHealth = (player, shipId, health) => {
  const prefix = player === 'player' ? '' : 'enemy-';
  const element = document.getElementById(`${prefix}${shipId}-status`);
  if (element) {
    const healthBar = element.querySelector('.health');
    const percentage = (health.currentHealth / health.maxHealth) * 100;
    healthBar.style.width = `${percentage}%`;
    
    // Change color based on health
    if (percentage <= 25) {
      healthBar.style.backgroundColor = 'var(--hit-red)';
    } else if (percentage <= 50) {
      healthBar.style.backgroundColor = 'var(--warning-color, orange)';
    }
    
    // Add animation for damage
    healthBar.style.animation = 'none';
    setTimeout(() => {
      healthBar.style.animation = 'pulse 0.5s';
    }, 10);
  }
};

// Reset all ship health displays
const resetShipHealthDisplay = () => {
  Object.keys(shipHealthStatus.player).forEach(shipId => {
    const health = shipHealthStatus.player[shipId];
    health.currentHealth = health.maxHealth;
    updateShipHealth('player', shipId, health);
  });
  
  Object.keys(shipHealthStatus.computer).forEach(shipId => {
    const health = shipHealthStatus.computer[shipId];
    health.currentHealth = health.maxHealth;
    updateShipHealth('computer', shipId, health);
  });
};

// Create 10 x 10 board
const renderBoard = (boardElement, gameboard, hideShips = false) => {
  boardElement.innerHTML = '';
  const board = gameboard.getBoard();
  const cellSize = 35; // Match the --cell-size CSS variable
  
  // Add row labels (1-10)
  for (let row = 0; row < 10; row++) {
    const rowLabel = document.createElement('div');
    rowLabel.classList.add('row-label');
    rowLabel.style.top = `${row * cellSize + cellSize/2}px`;
    rowLabel.textContent = row + 1;
    boardElement.appendChild(rowLabel);
    
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
    // Reset ship health displays
    resetShipHealthDisplay();
    
    // Render the battle boards
    renderBoard(playerBoardBattleElement, game.humanPlayer.gameboard);
    renderBoard(computerBoardElement, game.computerPlayer.gameboard, true);
    
    updateGamePhaseUI('battle');
    statusMessage.textContent = 'Game started! Click on the enemy waters to attack.';
    
    // Play sound
    playSound(sounds.place);
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
      statusMessage.textContent = 'Hit! You struck an enemy ship!';
      playSound(sounds.hit);
      
      // Update enemy ship health (simplified - in a real game you'd track which ship was hit)
      // This is a simplified version - ideally you'd track which specific ship was hit
      const shipTypes = Object.keys(shipHealthStatus.computer);
      for (const shipId of shipTypes) {
        const health = shipHealthStatus.computer[shipId];
        if (health.currentHealth > 0) {
          health.currentHealth--;
          updateShipHealth('computer', shipId, health);
          break;
        }
      }
    } else {
      e.target.classList.add('miss');
      statusMessage.textContent = 'Miss! Your shot landed in the water.';
      playSound(sounds.miss);
    }
    
    // Check if game is over
    if (result.gameOver) {
      statusMessage.textContent = 'You win! All enemy ships are sunk!';
      document.getElementById('winner-message').textContent = 'Victory! You destroyed the enemy fleet!';
      updateGamePhaseUI('gameOver');
      playSound(sounds.victory);
      return;
    }
    
    // Computer's turn to attack
    setTimeout(computerTurn, 1000);
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
    statusMessage.textContent = 'The enemy hit your ship!';
    playSound(sounds.hit);
    
    // Update player ship health (simplified)
    const shipTypes = Object.keys(shipHealthStatus.player);
    for (const shipId of shipTypes) {
      const health = shipHealthStatus.player[shipId];
      if (health.currentHealth > 0) {
        health.currentHealth--;
        updateShipHealth('player', shipId, health);
        break;
      }
    }
  } else {
    cell.classList.add('miss');
    statusMessage.textContent = 'The enemy missed!';
    playSound(sounds.miss);
  }
  
  // Check if game is over
  if (result.gameOver) {
    statusMessage.textContent = 'You lost! All your ships are sunk!';
    document.getElementById('winner-message').textContent = 'Defeat! Your fleet has been destroyed!';
    updateGamePhaseUI('gameOver');
    playSound(sounds.defeat);
  }
};

// Add radar ping effect to computer board
computerBoardElement.addEventListener('mouseover', (e) => {
  if (game.getGameStatus() !== 'playing') return;
  
  if (e.target.classList.contains('cell') && 
      !e.target.classList.contains('hit') && 
      !e.target.classList.contains('miss')) {
    
    // Add radar ping effect
    const ping = document.createElement('div');
    ping.classList.add('radar-ping');
    e.target.appendChild(ping);
    
    // Remove after animation completes
    setTimeout(() => {
      if (ping.parentNode === e.target) {
        e.target.removeChild(ping);
      }
    }, 1000);
  }
});

// Show setup phase initially
updateGamePhaseUI('setup');
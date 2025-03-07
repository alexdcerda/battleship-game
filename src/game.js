import Player from './player.js';

class Game {
  constructor() {
    this.humanPlayer = Player(false);
    this.computerPlayer = Player(true);
    this.previousHumanAttacks = [];
    this.previousComputerAttacks = [];
    this.gameStatus = 'setup'; // 'setup', 'playing', 'gameOver'
    this.availableShips = [
      { id: 'carrier', length: 5, placed: false },
      { id: 'battleship', length: 4, placed: false },
      { id: 'cruiser', length: 3, placed: false },
      { id: 'submarine', length: 3, placed: false },
      { id: 'destroyer', length: 2, placed: false }
    ];
  }

  initializeGame() {
    // Check if all player ships are placed
    if (this.availableShips.some(ship => !ship.placed)) {
      return { success: false, message: 'Place all ships before starting the game' };
    }
    
    // Place computer ships
    this.computerPlayer.placeShipsRandomly([5, 4, 3, 3, 2]);
    this.gameStatus = 'playing';
    
    return { success: true };
  }

  placePlayerShip(length, row, col, isHorizontal) {
    // Only allow ship placement during setup
    if (this.gameStatus !== 'setup') {
      return false;
    }
    
    // Find the ship with the specified length that hasn't been placed yet
    const shipToPlace = this.availableShips.find(ship => ship.length === length && !ship.placed);
    
    if (!shipToPlace) {
      return false; // No available ship with this length
    }
    
    // Try to place the ship
    const success = this.humanPlayer.gameboard.placeShip(length, row, col, isHorizontal);
    
    if (success) {
      shipToPlace.placed = true;
    }
    
    return success;
  }

  getAvailableShips() {
    return this.availableShips;
  }

  resetShipPlacement() {
    // Reset the player's gameboard
    this.humanPlayer = Player(false);
    
    // Reset available ships
    this.availableShips.forEach(ship => {
      ship.placed = false;
    });
  }

  playerAttack(row, col) {
    if (this.gameStatus !== 'playing') {
      return null;
    }

    // Validate if attack is duplicate
    if (this.isAttackDuplicate(row, col, this.previousHumanAttacks)) {
      return { valid: false, message: 'Position already attacked' };
    }

    this.previousHumanAttacks.push({ row, col });
    const isHit = this.humanPlayer.attack(this.computerPlayer.gameboard, row, col);
    
    const result = {
      valid: true,
      hit: isHit,
      gameOver: this.computerPlayer.gameboard.allShipsSunk()
    };

    if (result.gameOver) {
      this.gameStatus = 'gameOver';
    }

    return result;
  }

  computerAttack() {
    if (this.gameStatus !== 'playing') {
      return null;
    }

    const attack = this.computerPlayer.makeRandomAttack(
      this.humanPlayer.gameboard, 
      this.previousComputerAttacks
    );
    
    this.previousComputerAttacks.push(attack);
    
    const result = {
      ...attack,
      gameOver: this.humanPlayer.gameboard.allShipsSunk()
    };

    if (result.gameOver) {
      this.gameStatus = 'gameOver';
    }

    return result;
  }

  isAttackDuplicate(row, col, previousAttacks) {
    return previousAttacks.some(attack => 
      attack.row === row && attack.col === col
    );
  }

  getGameStatus() {
    return this.gameStatus;
  }

  areAllShipsPlaced() {
    return this.availableShips.every(ship => ship.placed);
  }
}

export default Game; 
import Ship from './ship.js';

const Gameboard = () => {
  // Initialize 10x10 board with null values (no ships)
  const board = Array(10).fill().map(() => Array(10).fill(null));
  const ships = [];
  const missedAttacks = [];

  // Place a ship at specific coordinates
  const placeShip = (length, row, col, isHorizontal) => {
    // Check if the ship can be placed at the given coordinates
    if (!canPlaceShip(length, row, col, isHorizontal)) {
      return false;
    }

    // Create a new ship
    const ship = Ship(length);
    ships.push(ship);

    // Place the ship on the board
    for (let i = 0; i < length; i++) {
      const currentRow = isHorizontal ? row : row + i;
      const currentCol = isHorizontal ? col + i : col;
      board[currentRow][currentCol] = { ship, index: i };
    }

    return true;
  };

  // Check if a ship can be placed at specific coordinates
  const canPlaceShip = (length, row, col, isHorizontal) => {
    for (let i = 0; i < length; i++) {
      const currentRow = isHorizontal ? row : row + i;
      const currentCol = isHorizontal ? col + i : col;

      // Check if the coordinates are within the board
      if (currentRow < 0 || currentRow >= 10 || currentCol < 0 || currentCol >= 10) {
        return false;
      }

      // Check if there's already a ship at these coordinates
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
    }
    return true;
  };

  // Receive an attack at specific coordinates
  const receiveAttack = (row, col) => {
    // Check if the coordinates are valid
    if (row < 0 || row >= 10 || col < 0 || col >= 10) {
      return false;
    }

    // Get the cell at the given coordinates
    const cell = board[row][col];

    // If there's a ship at these coordinates, hit it
    if (cell !== null) {
      const { ship } = cell;
      ship.hit();
      return true;
    } else {
      // Record the missed attack
      missedAttacks.push({ row, col });
      return false;
    }
  };

  // Check if all ships have been sunk
  const allShipsSunk = () => {
    return ships.length > 0 && ships.every(ship => ship.isSunk());
  };

  // Get the board
  const getBoard = () => {
    return board;
  };

  // Get the missed attacks
  const getMissedAttacks = () => {
    return missedAttacks;
  };

  return {
    placeShip,
    receiveAttack,
    allShipsSunk,
    getBoard,
    getMissedAttacks
  };
};

export default Gameboard;
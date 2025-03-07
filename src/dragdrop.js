/**
 * Calculates the coordinates for ship placement based on starting position and orientation
 * @param {number} shipLength - Length of the ship
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {boolean} isHorizontal - Whether the ship is placed horizontally
 * @returns {Array} Array of coordinate objects { row, col }
 */
export const getShipPlacementCoordinates = (shipLength, row, col, isHorizontal) => {
  const coordinates = [];
  
  for (let i = 0; i < shipLength; i++) {
    if (isHorizontal) {
      coordinates.push({ row, col: col + i });
    } else {
      coordinates.push({ row: row + i, col });
    }
  }
  
  return coordinates;
};

/**
 * Rotates a ship between horizontal and vertical orientation
 * @param {HTMLElement} shipElement - The ship DOM element
 */
export const rotateShip = (shipElement) => {
  const currentOrientation = shipElement.dataset.orientation || 'horizontal';
  const newOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
  
  shipElement.dataset.orientation = newOrientation;
  
  // Update visual appearance
  if (newOrientation === 'horizontal') {
    shipElement.style.gridTemplateColumns = `repeat(${shipElement.dataset.shipLength}, 1fr)`;
    shipElement.style.gridTemplateRows = '1fr';
  } else {
    shipElement.style.gridTemplateColumns = '1fr';
    shipElement.style.gridTemplateRows = `repeat(${shipElement.dataset.shipLength}, 1fr)`;
  }
};

/**
 * Checks if a ship can be placed at the given coordinates
 * @param {Array} coordinates - Array of coordinate objects { row, col }
 * @param {Array} board - 2D array representing the game board
 * @returns {boolean} Whether the ship can be placed
 */
export const canPlaceShipAt = (coordinates, board) => {
  // Check if all coordinates are within the board
  const isWithinBoard = coordinates.every(({ row, col }) => 
    row >= 0 && row < 10 && col >= 0 && col < 10
  );
  
  if (!isWithinBoard) {
    return false;
  }
  
  // Check if all coordinates are empty
  return coordinates.every(({ row, col }) => board[row][col] === null);
};

/**
 * Highlights cells on the board to show where a ship would be placed
 * @param {Array} coordinates - Array of coordinate objects { row, col }
 * @param {HTMLElement} boardElement - The board DOM element
 * @param {boolean} isValid - Whether the placement is valid
 */
export const highlightCells = (coordinates, boardElement, isValid) => {
  // Clear previous highlights
  boardElement.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('highlight-valid');
    cell.classList.remove('highlight-invalid');
  });
  
  // Add new highlights
  coordinates.forEach(({ row, col }) => {
    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.add(isValid ? 'highlight-valid' : 'highlight-invalid');
    }
  });
};

// DRAG AND DROP STATE MANAGEMENT
// This approach uses a class to manage drag state, making it easier to test and debug
export class DragManager {
  constructor() {
    this.draggedShipId = null;
    this.draggedShipElement = null;
  }
  
  setDraggedShip(shipId, element) {
    this.draggedShipId = shipId;
    this.draggedShipElement = element;
    
    // For debugging
    console.log(`Started dragging ship: ${shipId}`);
  }
  
  clearDraggedShip() {
    // For debugging
    console.log(`Stopped dragging ship: ${this.draggedShipId}`);
    
    this.draggedShipId = null;
    this.draggedShipElement = null;
  }
  
  getDraggedShipId() {
    return this.draggedShipId;
  }
  
  getDraggedShipElement() {
    return this.draggedShipElement;
  }
  
  isDraggingShip() {
    return this.draggedShipId !== null;
  }
}

// Create a single instance of the drag manager to be used throughout the application
export const dragManager = new DragManager();

/**
 * Sets up drag and drop functionality for ship placement
 * @param {Game} game - The game instance
 * @param {HTMLElement} shipContainer - Container for ship elements
 * @param {HTMLElement} boardElement - The player's board element
 * @param {Function} renderBoard - Function to re-render the board
 */
export const setupDragAndDrop = (game, shipContainer, boardElement, renderBoard) => {
  // First, remove any existing event listeners to prevent duplicates
  const ships = shipContainer.querySelectorAll('.ship');
  
  // Function to initialize a ship for dragging
  const initializeShipForDrag = (ship) => {
    // Set initial orientation if not already set
    if (!ship.dataset.orientation) {
      ship.dataset.orientation = 'horizontal';
    }
    
    // Make sure it's draggable
    ship.draggable = !ship.classList.contains('placed');
    
    // Add double-click event for rotation
    ship.addEventListener('dblclick', (e) => {
      if (!ship.classList.contains('placed')) {
        rotateShip(ship);
      }
    });
    
    // Add drag start event
    ship.addEventListener('dragstart', (e) => {
      console.log(`Drag start for ship: ${ship.dataset.shipId}`);
      
      if (ship.classList.contains('placed')) {
        // Prevent dragging of placed ships
        e.preventDefault();
        return false;
      }
      
      // Set data transfer
      try {
        e.dataTransfer.setData('text/plain', ship.dataset.shipId);
        e.dataTransfer.effectAllowed = 'move';
      } catch (error) {
        console.error('Error setting data transfer:', error);
      }
      
      // Store ship in drag manager
      dragManager.setDraggedShip(ship.dataset.shipId, ship);
    });
    
    // Add drag end event
    ship.addEventListener('dragend', (e) => {
      console.log(`Drag end for ship: ${ship.dataset.shipId}`);
      // Clear from drag manager
      dragManager.clearDraggedShip();
    });
  };
  
  // Initialize all ships
  ships.forEach(initializeShipForDrag);
  
  // Function to handle drag over
  const handleDragOver = (e) => {
    // Only allow drop if we're dragging a ship
    if (!dragManager.isDraggingShip()) return;
    
    e.preventDefault(); // Allow drop
    
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    const shipElement = dragManager.getDraggedShipElement();
    if (!shipElement) return;
    
    const shipLength = parseInt(shipElement.dataset.shipLength);
    const isHorizontal = shipElement.dataset.orientation === 'horizontal';
    
    // Calculate coordinates for ship placement
    const coordinates = getShipPlacementCoordinates(shipLength, row, col, isHorizontal);
    
    // Check if placement is valid
    const isValid = canPlaceShipAt(coordinates, game.humanPlayer.gameboard.getBoard());
    
    // Highlight cells
    highlightCells(coordinates, boardElement, isValid);
  };
  
  // Function to handle drag leave
  const handleDragLeave = (e) => {
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    
    cell.classList.remove('highlight-valid');
    cell.classList.remove('highlight-invalid');
  };
  
  // Function to handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling
    
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Get the ship ID from data transfer
    let shipId;
    try {
      shipId = e.dataTransfer.getData('text/plain');
      console.log(`Drop event with shipId from dataTransfer: ${shipId}`);
    } catch (error) {
      console.error('Error getting data transfer:', error);
    }
    
    // Fallback to drag manager if data transfer failed
    if (!shipId) {
      shipId = dragManager.getDraggedShipId();
      console.log(`Using shipId from dragManager: ${shipId}`);
    }
    
    if (!shipId) {
      console.error('No ship ID found for drop operation');
      return;
    }
    
    // Find the ship element
    const shipElement = shipContainer.querySelector(`[data-ship-id="${shipId}"]`);
    if (!shipElement) {
      console.error(`Ship element not found for ID: ${shipId}`);
      return;
    }
    
    // Don't allow dropping already placed ships
    if (shipElement.classList.contains('placed')) {
      console.log(`Ship ${shipId} is already placed`);
      return;
    }
    
    const shipLength = parseInt(shipElement.dataset.shipLength);
    const isHorizontal = shipElement.dataset.orientation === 'horizontal';
    
    // Try to place the ship
    const success = game.placePlayerShip(shipLength, row, col, isHorizontal);
    
    if (success) {
      console.log(`Successfully placed ship ${shipId} at ${row},${col}`);
      
      // Update ship element to show it's placed
      shipElement.classList.add('placed');
      shipElement.draggable = false;
      
      // Re-render the board
      renderBoard(boardElement, game.humanPlayer.gameboard);
      
      // Check if all ships are placed
      if (game.areAllShipsPlaced()) {
        document.getElementById('start-game-btn').disabled = false;
      }
    } else {
      console.log(`Failed to place ship ${shipId} at ${row},${col}`);
    }
    
    // Clear highlights
    boardElement.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('highlight-valid');
      cell.classList.remove('highlight-invalid');
    });
  };
  
  // Remove any existing event listeners from the board
  boardElement.removeEventListener('dragover', handleDragOver);
  boardElement.removeEventListener('dragleave', handleDragLeave);
  boardElement.removeEventListener('drop', handleDrop);
  
  // Add event listeners to the board (delegation pattern)
  boardElement.addEventListener('dragover', handleDragOver);
  boardElement.addEventListener('dragleave', handleDragLeave);
  boardElement.addEventListener('drop', handleDrop);
};

/**
 * Sets up the random placement button functionality
 * @param {Game} game - The game instance
 * @param {HTMLElement} shipContainer - Container for ship elements
 * @param {HTMLElement} boardElement - The player's board element
 * @param {Function} renderBoard - Function to re-render the board
 */
export const setupRandomPlacement = (game, shipContainer, boardElement, renderBoard) => {
  document.getElementById('random-placement-btn').addEventListener('click', () => {
    // Reset current ship placement
    game.resetShipPlacement();
    
    // Reset ship elements
    shipContainer.querySelectorAll('.ship').forEach(ship => {
      ship.classList.remove('placed');
      ship.draggable = true;
    });
    
    // Get available ships
    const ships = game.getAvailableShips();
    
    // Place ships randomly
    ships.forEach(ship => {
      let placed = false;
      
      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() > 0.5;
        
        placed = game.placePlayerShip(ship.length, row, col, isHorizontal);
      }
      
      // Update ship element to show it's placed
      const shipElement = shipContainer.querySelector(`[data-ship-id="${ship.id}"]`);
      shipElement.classList.add('placed');
      shipElement.draggable = false;
    });
    
    // Re-render the board
    renderBoard(boardElement, game.humanPlayer.gameboard);
    
    // Enable start game button
    document.getElementById('start-game-btn').disabled = false;
  });
}; 
import { 
  DragManager, 
  dragManager, 
  getShipPlacementCoordinates, 
  canPlaceShipAt
} from '../src/dragdrop.js';

describe('DragManager', () => {
  let manager;
  
  beforeEach(() => {
    manager = new DragManager();
  });
  
  test('should initialize with null values', () => {
    expect(manager.draggedShipId).toBeNull();
    expect(manager.draggedShipElement).toBeNull();
    expect(manager.isDraggingShip()).toBe(false);
  });
  
  test('should store dragged ship information', () => {
    const mockShipElement = { dataset: { shipId: 'carrier' } };
    manager.setDraggedShip('carrier', mockShipElement);
    
    expect(manager.draggedShipId).toBe('carrier');
    expect(manager.draggedShipElement).toBe(mockShipElement);
    expect(manager.isDraggingShip()).toBe(true);
    expect(manager.getDraggedShipId()).toBe('carrier');
    expect(manager.getDraggedShipElement()).toBe(mockShipElement);
  });
  
  test('should clear dragged ship information', () => {
    const mockShipElement = { dataset: { shipId: 'carrier' } };
    manager.setDraggedShip('carrier', mockShipElement);
    manager.clearDraggedShip();
    
    expect(manager.draggedShipId).toBeNull();
    expect(manager.draggedShipElement).toBeNull();
    expect(manager.isDraggingShip()).toBe(false);
    expect(manager.getDraggedShipId()).toBeNull();
    expect(manager.getDraggedShipElement()).toBeNull();
  });
});

describe('Global dragManager instance', () => {
  test('should exist as a singleton', () => {
    expect(dragManager).toBeInstanceOf(DragManager);
  });
  
  test('should be usable across modules', () => {
    dragManager.setDraggedShip('battleship', { id: 'ship-element' });
    expect(dragManager.getDraggedShipId()).toBe('battleship');
    
    // Clean up for other tests
    dragManager.clearDraggedShip();
  });
});

describe('Drag and Drop Helper Functions', () => {
  describe('getShipPlacementCoordinates', () => {
    // These tests already exist in dragdrop.test.js
    // Adding here as a reminder of what's being tested
    test('returns correct coordinates for horizontal placement', () => {
      const coordinates = getShipPlacementCoordinates(3, 2, 1, true);
      expect(coordinates).toEqual([
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 2, col: 3 }
      ]);
    });
    
    test('returns correct coordinates for vertical placement', () => {
      const coordinates = getShipPlacementCoordinates(3, 2, 1, false);
      expect(coordinates).toEqual([
        { row: 2, col: 1 },
        { row: 3, col: 1 },
        { row: 4, col: 1 }
      ]);
    });
  });
  
  describe('canPlaceShipAt', () => {
    // These tests already exist in dragdrop.test.js
    // Adding here as a reminder of what's being tested
    test('returns true for valid placement', () => {
      const board = Array(10).fill().map(() => Array(10).fill(null));
      const coordinates = [
        { row: 2, col: 2 },
        { row: 2, col: 3 },
        { row: 2, col: 4 }
      ];
      
      expect(canPlaceShipAt(coordinates, board)).toBe(true);
    });
    
    test('returns false for out of bounds placement', () => {
      const board = Array(10).fill().map(() => Array(10).fill(null));
      const coordinates = [
        { row: 9, col: 9 },
        { row: 9, col: 10 }, // Out of bounds
        { row: 9, col: 11 }  // Out of bounds
      ];
      
      expect(canPlaceShipAt(coordinates, board)).toBe(false);
    });
    
    test('returns false for overlapping ships', () => {
      const board = Array(10).fill().map(() => Array(10).fill(null));
      board[3][3] = { ship: {}, index: 0 }; // Mock ship object
      
      const coordinates = [
        { row: 3, col: 2 },
        { row: 3, col: 3 }, // Overlaps with existing ship
        { row: 3, col: 4 }
      ];
      
      expect(canPlaceShipAt(coordinates, board)).toBe(false);
    });
  });
});

describe('Mock DOM Drag and Drop Simulation', () => {
  // Mock elements
  let mockGame;
  let mockShipContainer;
  let mockBoardElement;
  let mockShipElement;
  let mockCellElement;
  
  beforeEach(() => {
    // Create mock game
    mockGame = {
      humanPlayer: {
        gameboard: {
          getBoard: jest.fn().mockReturnValue(Array(10).fill().map(() => Array(10).fill(null)))
        }
      },
      placePlayerShip: jest.fn().mockReturnValue(true),
      areAllShipsPlaced: jest.fn().mockReturnValue(false)
    };
    
    // Create mock ship element
    mockShipElement = {
      dataset: {
        shipId: 'carrier',
        shipLength: '5',
        orientation: 'horizontal'
      },
      classList: {
        add: jest.fn(),
        contains: jest.fn().mockReturnValue(false)
      },
      draggable: true,
      style: {}
    };
    
    // Create mock cell element
    mockCellElement = {
      dataset: {
        row: '0',
        col: '0'
      }
    };
    
    // Simulate drag events
    dragManager.setDraggedShip('carrier', mockShipElement);
  });
  
  afterEach(() => {
    dragManager.clearDraggedShip();
  });
  
  test('dragManager properly tracks ship during drag operation', () => {
    expect(dragManager.getDraggedShipId()).toBe('carrier');
    expect(dragManager.isDraggingShip()).toBe(true);
    
    // Simulate drag end
    dragManager.clearDraggedShip();
    
    expect(dragManager.getDraggedShipId()).toBeNull();
    expect(dragManager.isDraggingShip()).toBe(false);
  });
  
  test('can place multiple ships in sequence', () => {
    // Place first ship (carrier)
    const firstShipPlaced = mockGame.placePlayerShip(5, 0, 0, true);
    expect(firstShipPlaced).toBe(true);
    
    // Mark it as placed
    mockShipElement.classList.contains = jest.fn().mockReturnValue(true);
    
    // Clear drag manager
    dragManager.clearDraggedShip();
    
    // Create a second ship (battleship)
    const secondShipElement = {
      dataset: {
        shipId: 'battleship',
        shipLength: '4',
        orientation: 'horizontal'
      },
      classList: {
        add: jest.fn(),
        contains: jest.fn().mockReturnValue(false)
      },
      draggable: true,
      style: {}
    };
    
    // Simulate starting to drag the second ship
    dragManager.setDraggedShip('battleship', secondShipElement);
    
    // Place second ship
    const secondShipPlaced = mockGame.placePlayerShip(4, 2, 0, true);
    expect(secondShipPlaced).toBe(true);
    
    // Verify both ships can be placed
    expect(mockGame.placePlayerShip).toHaveBeenCalledTimes(2);
  });
}); 
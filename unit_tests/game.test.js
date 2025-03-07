import Game from '../src/game.js';
import Player from '../src/player.js';
import Gameboard from '../src/gameboard.js';

// Mock the Player and Gameboard modules
jest.mock('../src/player.js');
jest.mock('../src/gameboard.js');

describe('Game', () => {
  let game;
  let mockHumanGameboard;
  let mockComputerGameboard;
  let mockHumanPlayer;
  let mockComputerPlayer;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock gameboards
    mockHumanGameboard = {
      placeShip: jest.fn().mockReturnValue(true),
      receiveAttack: jest.fn().mockReturnValue(false),
      allShipsSunk: jest.fn().mockReturnValue(false),
      getBoard: jest.fn().mockReturnValue(Array(10).fill().map(() => Array(10).fill(null)))
    };
    
    mockComputerGameboard = {
      placeShip: jest.fn().mockReturnValue(true),
      receiveAttack: jest.fn().mockReturnValue(false),
      allShipsSunk: jest.fn().mockReturnValue(false),
      getBoard: jest.fn().mockReturnValue(Array(10).fill().map(() => Array(10).fill(null)))
    };
    
    // Setup mock players
    mockHumanPlayer = {
      isComputer: false,
      gameboard: mockHumanGameboard,
      attack: jest.fn().mockImplementation((gameboard, row, col) => {
        return gameboard.receiveAttack(row, col);
      }),
      makeRandomAttack: jest.fn(),
      placeShipsRandomly: jest.fn()
    };
    
    mockComputerPlayer = {
      isComputer: true,
      gameboard: mockComputerGameboard,
      attack: jest.fn().mockImplementation((gameboard, row, col) => {
        return gameboard.receiveAttack(row, col);
      }),
      makeRandomAttack: jest.fn().mockReturnValue({ row: 0, col: 0, hit: false }),
      placeShipsRandomly: jest.fn()
    };
    
    // Mock the Player factory function
    Player.mockImplementation((isComputer) => {
      return isComputer ? mockComputerPlayer : mockHumanPlayer;
    });
    
    // Create game instance
    game = new Game();
    
    // Mark all ships as placed to allow game initialization
    game.availableShips.forEach(ship => {
      ship.placed = true;
    });
  });

  test('initializes with correct state', () => {
    expect(game.gameStatus).toBe('setup');
    expect(game.previousHumanAttacks).toEqual([]);
    expect(game.previousComputerAttacks).toEqual([]);
  });

  test('places ships for computer player when game is initialized', () => {
    const result = game.initializeGame();
    expect(result.success).toBe(true);
    expect(mockComputerPlayer.placeShipsRandomly).toHaveBeenCalledWith([5, 4, 3, 3, 2]);
    expect(game.gameStatus).toBe('playing');
  });

  test('prevents duplicate attacks', () => {
    game.initializeGame();
    game.previousHumanAttacks.push({ row: 0, col: 0 });
    
    const result = game.playerAttack(0, 0);
    
    expect(result).toEqual({
      valid: false,
      message: 'Position already attacked'
    });
  });

  test('processes valid player attack', () => {
    game.initializeGame();
    mockComputerGameboard.receiveAttack.mockReturnValueOnce(true); // Hit
    
    const result = game.playerAttack(0, 0);
    
    expect(result).toEqual({
      valid: true,
      hit: true,
      gameOver: false
    });
    expect(game.previousHumanAttacks).toContainEqual({ row: 0, col: 0 });
    expect(mockHumanPlayer.attack).toHaveBeenCalledWith(mockComputerGameboard, 0, 0);
  });

  test('detects game over when all computer ships are sunk', () => {
    game.initializeGame();
    mockComputerGameboard.receiveAttack.mockReturnValueOnce(true); // Hit
    mockComputerGameboard.allShipsSunk.mockReturnValueOnce(true);
    
    const result = game.playerAttack(0, 0);
    
    expect(result).toEqual({
      valid: true,
      hit: true,
      gameOver: true
    });
    expect(game.gameStatus).toBe('gameOver');
  });

  test('processes computer attack', () => {
    game.initializeGame();
    const mockAttack = { row: 1, col: 1, hit: true };
    mockComputerPlayer.makeRandomAttack.mockReturnValueOnce(mockAttack);
    
    const result = game.computerAttack();
    
    expect(result).toEqual({
      row: 1,
      col: 1,
      hit: true,
      gameOver: false
    });
    expect(game.previousComputerAttacks).toContainEqual(mockAttack);
  });

  test('detects game over when all human ships are sunk', () => {
    game.initializeGame();
    mockHumanGameboard.allShipsSunk.mockReturnValueOnce(true);
    mockComputerPlayer.makeRandomAttack.mockReturnValueOnce({ row: 0, col: 0, hit: true });
    
    const result = game.computerAttack();
    
    expect(result).toEqual({
      row: 0,
      col: 0,
      hit: true,
      gameOver: true
    });
    expect(game.gameStatus).toBe('gameOver');
  });

  test('prevents starting game if not all ships are placed', () => {
    // Reset ship placement status
    game.availableShips.forEach(ship => {
      ship.placed = false;
    });
    
    const result = game.initializeGame();
    expect(result).toEqual({
      success: false,
      message: 'Place all ships before starting the game'
    });
    expect(game.gameStatus).toBe('setup');
  });

  test('allows player to place ship during setup', () => {
    // Reset ship placement status
    game.availableShips.forEach(ship => {
      ship.placed = false;
    });
    
    const result = game.placePlayerShip(5, 0, 0, true);
    expect(result).toBe(true);
    expect(mockHumanGameboard.placeShip).toHaveBeenCalledWith(5, 0, 0, true);
    
    // Check that the carrier is marked as placed
    const carrier = game.availableShips.find(ship => ship.length === 5);
    expect(carrier.placed).toBe(true);
  });

  test('prevents player from placing ship after game starts', () => {
    // Reset ship placement status
    game.availableShips.forEach(ship => {
      ship.placed = false;
    });
    
    // Update one ship to be placeable
    game.availableShips[0].placed = false;
    
    // Change game status to playing
    game.gameStatus = 'playing';
    
    const result = game.placePlayerShip(5, 0, 0, true);
    expect(result).toBe(false);
    expect(mockHumanGameboard.placeShip).not.toHaveBeenCalled();
  });
  
  test('resetShipPlacement resets the player gameboard and ship statuses', () => {
    // Mark all ships as placed
    game.availableShips.forEach(ship => {
      ship.placed = true;
    });
    
    game.resetShipPlacement();
    
    // Check that all ships are marked as not placed
    expect(game.availableShips.every(ship => !ship.placed)).toBe(true);
    // A new player should have been created
    expect(Player).toHaveBeenCalledWith(false);
  });
  
  test('areAllShipsPlaced returns true when all ships are placed', () => {
    // Mark all ships as placed
    game.availableShips.forEach(ship => {
      ship.placed = true;
    });
    
    expect(game.areAllShipsPlaced()).toBe(true);
  });
  
  test('areAllShipsPlaced returns false when not all ships are placed', () => {
    // Mark one ship as not placed
    game.availableShips[0].placed = false;
    
    expect(game.areAllShipsPlaced()).toBe(false);
  });
}); 
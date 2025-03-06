import Player from '../src/player.js';
import Gameboard from '../src/gameboard.js';

describe('Player factory', () => {
  let humanPlayer;
  let computerPlayer;
  let opponentGameboard;

  beforeEach(() => {
    humanPlayer = Player(false);
    computerPlayer = Player(true);
    opponentGameboard = Gameboard();
    
    // Place a ship on the opponent's gameboard for testing attacks
    opponentGameboard.placeShip(3, 0, 0, true);
  });

  test('creates a human player', () => {
    expect(humanPlayer.isComputer).toBe(false);
    expect(humanPlayer.gameboard).toBeDefined();
  });

  test('creates a computer player', () => {
    expect(computerPlayer.isComputer).toBe(true);
    expect(computerPlayer.gameboard).toBeDefined();
  });

  test('human player can attack opponent gameboard', () => {
    // Attack a position with a ship
    expect(humanPlayer.attack(opponentGameboard, 0, 0)).toBe(true);
    
    // Attack a position without a ship
    expect(humanPlayer.attack(opponentGameboard, 5, 5)).toBe(false);
  });

  test('computer player can make random attacks', () => {
    const attack = computerPlayer.makeRandomAttack(opponentGameboard);
    
    // Verify the attack returns coordinates and hit status
    expect(attack).toHaveProperty('row');
    expect(attack).toHaveProperty('col');
    expect(attack).toHaveProperty('hit');
    
    // Row and column should be between 0 and 9
    expect(attack.row).toBeGreaterThanOrEqual(0);
    expect(attack.row).toBeLessThan(10);
    expect(attack.col).toBeGreaterThanOrEqual(0);
    expect(attack.col).toBeLessThan(10);
  });

  test('computer player avoids attacking the same position twice', () => {
    // Make a first attack
    const attack1 = computerPlayer.makeRandomAttack(opponentGameboard);
    
    // Make a second attack with the previous attack as history
    const attack2 = computerPlayer.makeRandomAttack(opponentGameboard, [attack1]);
    
    // Verify the second attack is different from the first
    expect(attack1.row === attack2.row && attack1.col === attack2.col).toBe(false);
  });

  test('human player cannot make random attacks', () => {
    expect(humanPlayer.makeRandomAttack(opponentGameboard)).toBeNull();
  });

  test('placing ships randomly works', () => {
    computerPlayer.placeShipsRandomly([5, 4, 3, 3, 2]);
    
    // Check that all ships are placed (looking for non-null cells)
    const board = computerPlayer.gameboard.getBoard();
    let shipCellCount = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (board[row][col] !== null) {
          shipCellCount++;
        }
      }
    }
    
    // Total should be 5+4+3+3+2 = 17
    expect(shipCellCount).toBe(17);
  });
});
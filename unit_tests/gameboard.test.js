import Gameboard from "../src/gameboard";

describe("Gameboard factory", () => {
  let gameboard;

  beforeEach(() => {
    gameboard = Gameboard();
  });
  test("can place ships at specific coordinates horizontally", () => {
    expect(gameboard.placeShip(3, 0, 0, true)).toBe(true);
    const board = gameboard.getBoard();

    expect(board[0][0]).not.toBeNull();
    expect(board[0][1]).not.toBeNull();
    expect(board[0][2]).not.toBeNull();
    expect(board[0][3]).toBeNull();
  });
  test("can place ships at specific coordinates vertically", () => {
    expect(gameboard.placeShip(3, 0, 0, false)).toBe(true);
    const board = gameboard.getBoard();

    expect(board[0][0]).not.toBeNull();
    expect(board[1][0]).not.toBeNull();
    expect(board[2][0]).not.toBeNull();
    expect(board[3][0]).toBeNull();
  });

  test("cannot place ships that would extend beyond the board", () => {
    expect(gameboard.placeShip(3, 9, 9, true)).toBe(false);
    expect(gameboard.placeShip(3, 9, 9, false)).toBe(false);
  });

  test("cannot place ships that would overlap with existing ships", () => {
    gameboard.placeShip(3, 0, 0, true);
    expect(gameboard.placeShip(3, 0, 0, true)).toBe(false);
    expect(gameboard.placeShip(3, 0, 1, true)).toBe(false);
  });

  test("receiveAttack records a hit when a ship is at the coordinates", () => {
    gameboard.placeShip(3, 0, 0, true);
    expect(gameboard.receiveAttack(0, 0)).toBe(true);
    expect(gameboard.receiveAttack(0, 1)).toBe(true);
    expect(gameboard.receiveAttack(0, 2)).toBe(true);
  });

  test("receiveAttack records a miss when no ship is at the coordinates", () => {
    gameboard.placeShip(3, 0, 0, true);
    expect(gameboard.receiveAttack(1, 0)).toBe(false);

    const missedAttacks = gameboard.getMissedAttacks();
    expect(missedAttacks.length).toBe(1);
    expect(missedAttacks[0]).toEqual({ row: 1, col: 0 });
  });

  test("allShipsSunk reports true when all ships are sunk", () => {
    gameboard.placeShip(2, 0, 0, true);
    gameboard.placeShip(3, 2, 0, true);

    // Sink all ships
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 1);
    gameboard.receiveAttack(2, 0);
    gameboard.receiveAttack(2, 1);
    gameboard.receiveAttack(2, 2);

    expect(gameboard.allShipsSunk()).toBe(true);
  });

  test("allShipsSunk reports false when not all ships are sunk", () => {
    gameboard.placeShip(2, 0, 0, true);
    gameboard.placeShip(3, 2, 0, true);

    // Sink only one ship
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 1);

    expect(gameboard.allShipsSunk()).toBe(false);
  });

  test("allShipsSunk reports false when no ships on board", () => {
    expect(gameboard.allShipsSunk()).toBe(false);
  });
});

import Ship from '../src/ship.js'

describe('Ship factory', () => {
    test('creates a ship with the specified length', () => {
      const ship = Ship(3);
      expect(ship.length).toBe(3);
    });
  
    test('throws an error if length is not a positive integer', () => {
      expect(() => Ship(0)).toThrow('Ship length must be a positive integer');
      expect(() => Ship(-1)).toThrow('Ship length must be a positive integer');
      expect(() => Ship(2.5)).toThrow('Ship length must be a positive integer');
    });
  
    test('ship starts with 0 hits', () => {
      const ship = Ship(3);
      expect(ship.getHits()).toBe(0);
    });
  
    test('hit() increments the number of hits', () => {
      const ship = Ship(3);
      ship.hit();
      expect(ship.getHits()).toBe(1);
      ship.hit();
      expect(ship.getHits()).toBe(2);
    });
  
    test('hit() prevents exceeding the ship length', () => {
      const ship = Ship(2);
      expect(ship.hit()).toBe(true); // First hit successful
      expect(ship.hit()).toBe(true); // Second hit successful
      expect(ship.hit()).toBe(false); // Third hit fails
      expect(ship.getHits()).toBe(2); // Hits should remain at 2
    });
  
    test('isSunk() returns false when hits < length', () => {
      const ship = Ship(3);
      expect(ship.isSunk()).toBe(false);
      ship.hit();
      expect(ship.isSunk()).toBe(false);
      ship.hit();
      expect(ship.isSunk()).toBe(false);
    });
  
    test('isSunk() returns true when hits = length', () => {
      const ship = Ship(3);
      ship.hit();
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });
  });
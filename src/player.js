import Gameboard from './gameboard.js';

const Player = (isComputer = false) => {
  // Each player has their own gameboard
  const gameboard = Gameboard();
  
  // Attack the opponent's gameboard
  const attack = (opponentGameboard, row, col) => {
    return opponentGameboard.receiveAttack(row, col);
  };
  
  // For computer player: make a random attack
  const makeRandomAttack = (opponentGameboard, previousAttacks = []) => {
    if (!isComputer) {
      return null; // Only computer players can make random attacks
    }
    
    let validAttack = false;
    let row, col;
    
    // Keep trying random coordinates until we find an unattacked position
    while (!validAttack) {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      
      // Check if this position was already attacked
      const alreadyAttacked = previousAttacks.some(
        attack => attack.row === row && attack.col === col
      );
      
      if (!alreadyAttacked) {
        validAttack = true;
      }
    }
    
    // Make the attack
    const hit = attack(opponentGameboard, row, col);
    
    return { row, col, hit };
  };
  
  // Place ships randomly on the gameboard
  const placeShipsRandomly = (shipLengths) => {
    shipLengths.forEach(length => {
      let placed = false;
      
      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() > 0.5;
        
        placed = gameboard.placeShip(length, row, col, isHorizontal);
      }
    });
  };
  
  return {
    isComputer,
    gameboard,
    attack,
    makeRandomAttack,
    placeShipsRandomly
  };
};

export default Player;
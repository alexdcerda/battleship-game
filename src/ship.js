const Ship = (length) => {
    if (length <= 0 || !Number.isInteger(length)) {
      throw new Error('Ship length must be a positive integer');
    }
    
    let hits = 0;
    
    return {
      length,
      hit() {
        if (hits < length) {
          hits++;
          return true;
        }
        return false;
      },
      getHits() {
        return hits;
      },
      isSunk() {
        return hits >= length;
      }
    };
  };
export default Ship;

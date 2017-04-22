export class movement {
  constructor(board) {
    this._board = board
  }

  canPerform(pawn, target) {
    let strength = pawn.actions

    // default neighboor is the target
    let neighboors = this._board.getNeighboors(pawn.coord)

    // if there is a target, validate it and ignore the neighboors
    if (target) {
      let found = false
      for (let i=0; i<neighboors.length; i++) {
        if (target[0]===neighboors[i][0] && target[1]===neighboors[i][1]) {
          found = true
          break
        }
      }
      if (!found) {
        return false
      }

      neighboors = [target]
    }

    // check if the neighboors are ok
    for (let i=0; i<neighboors.length; i++) {
      let coord = neighboors[i]
      let tile = this._board.tiles[coord]
      let tileCost = tile.movementCost + pawn.movementMods[tile.id]||0

      if (strength >= tileCost) return true
    }

    return false
  }

  getTargets(pawnId) {

  }

  perform(pawnId, target) {

  }
}

export class attack {
  constructor(board) {
    this._board = board
  }

  canPerform(pawn, target) {
    // default neighboor is the target
    let neighboors = this._board.getNeighboors(pawn.coord, pawn.range)

    // Add pawn coord to neighboors because it can attack its own tile
    neighboors.push(pawn.coord)

    // if there is a target, validate it and ignore the neighboors
    if (target) {
      let found = false
      for (let i=0; i<neighboors.length; i++) {
        if (target[0]===neighboors[i][0] && target[1]===neighboors[i][1]) {
          found = true
          break
        }
      }
      if (!found) {
        return false
      }

      neighboors = [target]
    }

    // check if the neighboors are ok
    for (let i=0; i<neighboors.length; i++) {
      let coord = neighboors[i]
      let tile = this._board.tiles[coord]

      if (tile.enemies.length) return true
    }

    return false
  }

  getTargets(pawnId) {
    
  }

  perform(pawnId, target) {

  }
}

export class pickup {
  constructor(board) {
    this._board = board
  }

  canPerform(pawn, target) {
    if (!target) {
      target = pawn.coord
    }

    // Not the current tile
    if (target[0] !== pawn.coord[0] || target[1] !== pawn.coord[1]) {
      return false
    }

    return !!this._board.tiles[target].items.length
  }

  getTargets(pawnId) {
    
  }

  perform(pawnId, target) {

  }
}

export class wait {
  constructor(board) {
    this._board = board
  }

  canPerform(pawnId, target) {
    return true
  }

  getTargets(pawnId) {
    return false
  }

  perform(pawnId, target) {

  }
}
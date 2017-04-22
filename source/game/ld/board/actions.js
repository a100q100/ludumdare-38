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
      let tileCost = tile.movementCost + pawn.movementMods[tile.type]||0

      if (strength >= tileCost) return true
    }

    return false
  }

  getTargets(pawn) {
    let strength = pawn.actions
    let results = []

    // default neighboor is the target
    let neighboors = this._board.getNeighboors(pawn.coord)

    // check if the neighboors are ok
    for (let i=0; i<neighboors.length; i++) {
      let coord = neighboors[i]
      let tile = this._board.tiles[coord]
      let tileCost = tile.movementCost + pawn.movementMods[tile.type]||0

      if (strength >= tileCost) {
        results.push(coord)
      }
    }

    return results
  }

  perform(pawn, target) {
    let targetTile = this._board.tiles[target]
    let currentTile = this._board.tiles[pawn.coord]

    currentTile.removePawn(pawn.id)
    targetTile.addPawn(pawn.id)

    pawn.coord = target

    pawn.actions -= 1
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

  getTargets(pawn) {
    let results = []

    // default neighboor is the target
    let neighboors = this._board.getNeighboors(pawn.coord, pawn.range)
    neighboors.push(pawn.coord)

    // check if the neighboors are ok
    for (let i=0; i<neighboors.length; i++) {
      let coord = neighboors[i]
      let tile = this._board.tiles[coord]

      if (tile.enemies.length) {
        results.push(coord)
      }
    }

    return results
  }

  perform(pawn, target) {
    console.log('TODO: implement combat')

    pawn.actions = 0
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

    return !!this._board.tiles[target].item
  }

  getTargets(pawn) {
    return !!this._board.tiles[pawn.coord].item
  }

  perform(pawn, target) {
    let tile = this._board.tiles[pawn.coord]
    let item = tile.removeItem()

    this._board.inventory.push(item)
    pawn.actions -= 1
  }
}

export class wait {
  constructor(board) {
    this._board = board
  }

  canPerform(pawn, target) {
    return true
  }

  getTargets(pawn) {
    return true
  }

  perform(pawn, target) {
    pawn.actions = 0
  }
}
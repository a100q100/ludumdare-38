import * as utils from 'ld/board/utils'

export class movement {
  constructor(board) {
    this._board = board
  }

  canPerform(pawn, target) {
    let strength = pawn.actions

    // if there is enemies in the same time, it can't move
    let currentTile = this._board.tiles[pawn.coord]
    if (currentTile.enemies.length) {
      return false
    }

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
    let enemies = this._board.getEnemies(target)

    let attack = utils.dice(pawn.attack)
    let deads = []

    for (let i=0; i<enemies.length; i++) {
      // console.log('pawn attacking with', attack)
      let enemy = enemies[i]
      let defense = utils.dice(enemy.defense)
      // console.log(enemy.name, 'defending with', defense)

      let dead = attack - defense

      if (dead > 0) {
        let total = enemy.amount - dead
        if (total <= 0) {
          // console.log(enemy.name, 'dead')
          deads.push(i)
          enemy.amount = total
          attack = Math.abs(total)
        } else {
          // console.log(enemy.name, 'had', enemy.amount, 'and now have', total)
          enemy.amount = total
        }
      } 
    }

    for (let i=0; i<deads.length; i++) {
      // console.log('removing enemy ', deads[i], 'from board')
      let enemy = this._board.enemies.splice(deads[i], 1)[0]
      let tile = this._board.tiles[enemy.coord]

      tile.removeEnemy(enemy.id)
    }

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
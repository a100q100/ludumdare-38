import * as utils from 'ld/board/utils'

export default class Tile {
  constructor(data, coord) {
    this.type = data.type
    this.restrict = data.restrict
    this.movementCost = data.movementCost
    this.coord = coord

    this.pawns = []
    this.enemies = []
    this.item = null
    this.spawnPoint = false
    this.event = false
  }

  addPawn(id) { this.pawns.push(id) }
  removePawn(id) { 
    let index = this.pawns.indexOf(id)
    if (index >= 0) {
      return this.pawns.splice(this.pawns.indexOf(id), 1)
    }
  }

  addEnemy(id) { this.enemies.push(id) }
  removeEnemy(id) { 
    let index = this.enemies.indexOf(id)
    if (index >= 0) {
      return this.enemies.splice(this.enemies.indexOf(id), 1)
    }
  }

  addItem(id) { this.item = id }
  removeItem(id) { 
    let item = this.item
    this.item = null
    return item
  }

  addSpawnPoint(id) { this.spawnPoint = true }
  removeSpawnPoint(id) { 
    let v = this.spawnPoint
    this.spawnPoint = false
    return v
  }


}

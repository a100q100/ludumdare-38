import * as utils from 'ld/board/utils'

export default class Tile {
  constructor(data, coord) {
    this.id = data.id
    this.restrict = data.restrict
    this.movementCost = data.movementCost
    this.coord = coord

    this.pawns = []
    this.enemies = []
    this.items = []
    this.spawnPoint = false
    this.event = false
  }

  addPawn(id) { this.pawns.push(id) }
  removePawn(id) { 
    let index = this.pawns.indexOf(id)
    if (index > 0) {
      this.pawns.splice(this.pawns.indexOf(id), 1)
    }
  }

  addEnemy(id) { this.enemies.push(id) }
  removeEnemy(id) { 
    let index = this.enemies.indexOf(id)
    if (index > 0) {
      this.enemies.splice(this.enemies.indexOf(id), 1)
    }
  }

  addItem(id) { this.items.push(id) }
  removeItem(id) { 
    let index = this.items.indexOf(id)
    if (index > 0) {
      this.items.splice(this.items.indexOf(id), 1)
    }
  }

  addSpawnPoint(id) { this.spawnPoint = true }
  removeSpawnPoint(id) { this.spawnPoint = false }


}

import Pawn from 'ld/board/Pawn'
import Tile from 'ld/board/Tile'
import Enemy from 'ld/board/Enemy'
import astar from 'ld/board/astar'
import * as utils from 'ld/board/utils'
import * as actions from 'ld/board/actions'

var ID = 0

export default class Board {
  constructor(data) {
    this._data = data

    this._tiles = null
    this._pawns = null
    this._enemies = null
    this._spawnPoints = null
    this._inventory = null
    this._actions = {}
    
    for (let k in actions) {
      this._actions[k] = new actions[k](this)
    }
  }

  get tiles() { return this._tiles }
  get spawnPoints() { return this._spawnPoints }
  get pawns() { return this._pawns }
  get inventory() { return this._inventory }
  get enemies() { return this._enemies }

  /**
   * Game initialization 
   */
  loadMap(map, heroes) {
    this._tiles = {}
    this._pawns = {}
    this._spawnPoints = []

    // Convert tiles
    for (let i=0; i<map.tiles.length; i++) {
      let tile = map.tiles[i]
      let data = this._data.tiles[tile.type]
      let coord = [tile.q, tile.r]

      this._tiles[coord] = new Tile(data, coord)
    }

    // Set pawns
    let initialCoord = [map.initial.q, map.initial.r]
    for (let k in heroes) {
      let data = this._data.heroes[heroes[k]]
      this._pawns[k] = new Pawn(k, data, initialCoord)

      this.tiles[initialCoord].addPawn(k)
    }
    
    // Set spawn point
    for (let i=0; i<map.spawnPoints.length; i++) {
      let point = map.spawnPoints[i]
      this._spawnPoints.push([point.q, point.r])
      this.tiles[[point.q, point.r]].addSpawnPoint(i)
    }

    // Reset session
    this._initializeGame()
  }


  /**
   * Map related
   */
  getNeighboors(coord, range=1) {
    let neighboors = []
    let coords = utils.neighboors(coord, range)

    for (let i=0; i<coords.length; i++) {
      if (this._tiles[coords[i]]) {
        neighboors.push(coords[i])
      }
    }

    return neighboors
  }


  /**
   * Action related 
   */
  getActions(id) {
    let pawn = this._pawns[id]

    // No action remaining to this pawn
    if (pawn.actions <= 0) {
      return []
    }

    // Get possible movements
    let possibilities = []
    for (let k in this._actions) {
      let action = this._actions[k]

      if (action.canPerform(pawn)) {
        possibilities.push(k)
      }
    }

    return possibilities
  }

  getTargets(id, action) {
    let pawn = this.pawns[id]
    return this._actions[action].getTargets(pawn)
  }

  act(id, action, target) {
    if (this._turn !== 'player') {
      throw new Error('trying to act out of the turn')
    }

    let actions = this.getActions(id)

    if (actions.indexOf(action) < 0) {
      throw new Error('trying to perform an action on a pawn without the action')
    }

    action = this._actions[action]

    let pawn = this.pawns[id]
    if (!action.canPerform(pawn, target)) {
      throw new Error('trying to perform an action with an invalid target')
    }

    action.perform(pawn, target)

    if (this._isTurnEnded()) {
      this._nextTurn()
    }
  }


  /**
   * Combat
   */
  getEnemies(coord) {
    let enemies = []

    for (let i=0; i<this.enemies.length; i++) {
      let enemy = this.enemies[i]
      if (enemy.coord[0] === coord[0] && enemy.coord[1] === coord[1]) {
        enemies.push(enemy)
      }
    }

    enemies.sort((a, b) => a.priority - b.priority)
    return enemies
  }
  // pawnToEnemyCombat(attack, defense) {

  // }
  // enemyToPawnCombat()


  /**
   * Internal
   */
  _initializeGame() {
    this._enemies = []
    this._turnCount = 0
    this._difficulty = 0
    this._enemiesKilled = 0
    this._spawnDeck = this._data.spawn[this._difficulty].slice()
    this._inventory = []
    
    this._initializePlayerTurn()
  }
  _initializePlayerTurn() {
    // console.log('starting player turn')
    
    this._turn = 'player'
    for (let i in this.pawns) {
      // console.log('reseting pawn', i, 'actions')
      this.pawns[i].resetActions()
      // console.log('pawn', this.pawns[i].actions, 'actions')
    }
    this._turnCount += 1
  }
  _isTurnEnded() {
    for (let k in this._pawns) {
      if (this._pawns[k].actions > 0) return false
    }

    return true
  }

  /**
   * Machine turn
   */
  _nextTurn() {
    this._turn = 'machine'
    for (let i=0; i<this.enemies.length; i++) {
      this.enemies[i].resetActions()
    }
    
    this._spawn()
    this._moveEnemies()
    this._attackHeroes()

    this._initializePlayerTurn()

    this.report()
  }
  _spawn() {
    for (let i=0; i<this._spawnPoints.length; i++) {
      let spawn = this._spawnPoints[i]

      let index = Math.floor(Math.random()*this._spawnDeck.length)
      let spec = this._spawnDeck.splice(index, 1)[0]
      let data = this._data.enemies[spec.enemy]

      let enemy = new Enemy(++ID, data, spawn, spec.amount)

      this.tiles[spawn].addEnemy(enemy.id)
      this._enemies.push(enemy)
      
      if (!this._spawnDeck.length) {
        console.log('reseting deck')
        this._spawnDeck = this._data.spawn[this._difficulty].slice()
      }
    }
  }
  _moveEnemies() {
    for (let i=0; i<this._enemies.length; i++) {
      let enemy = this._enemies[i]

      // Get the nearest pawn
      let minDistance = 99999
      let minTarget = null

      for (let k in this.pawns) {
        let pawn = this.pawns[k]

        let distance = utils.distance(enemy.coord, pawn.coord)

        if (distance < minDistance) {
          minDistance = distance
          minTarget = pawn
        }
      }

      // Move towards the pawn
      if (minDistance <= 0 || enemy.actions <= 0) continue

      let path = astar(this, enemy.coord, minTarget.coord)
      if (path.length) {
        let dir = path[0]
        let target = utils.next(enemy.coord, dir)

        let targetTile = this.tiles[target]
        let currentTile = this.tiles[enemy.coord]

        currentTile.removeEnemy(enemy.id)
        targetTile.addEnemy(enemy.id)
        enemy.coord = target
        enemy.actions -= 1
      }
    }
  }
  _attackHeroes() {
    let attacks = {}

    // Compute attacks from all enemies in the same tile
    for (let i=0; i<this._enemies.length; i++) {
      let enemy = this._enemies[i]

      if (!enemy.actions) continue
      let tile = this.tiles[enemy.coord]

      if (!tile.pawns.length) continue

      if (!attacks[enemy.coord]) attacks[enemy.coord] = 0

      attacks[enemy.coord] += utils.dice(enemy.attack)
    }

    // Compute the combat
    for (let coord in attacks) {
      let attack = attacks[coord]

      console.log('Enemies attacking with', attack)

      let pawns = this.tiles[coord].pawns.map(x => this._pawns[x])
      let defense = pawns.reduce((v, x) => v+utils.dice(x.defense), 0)

      console.log('Pawns defending with', defense)

      if (attack > defense) {
        let dead = pawns[parseInt(Math.random()*pawns.length)]

        let tile = this.tiles[dead.coord]
        tile.removePawn(dead.id)

        delete this.pawns[dead.id]
        console.log(dead.name, 'is dead')

        if (!Object.keys(this._pawns).length) return
      }
    }
  }


  /**
   * Debug
   */
  report(c) {
    if (c) console.clear()
    console.log(``)
    console.log(`BOARD REPORT ==================================`)
    console.log(`Current turn: ${this._turnCount}`)
    console.log(`Inventory: ${this._inventory||'nothing'}`)
    console.log(``)
    console.log(`Important tiles:`)
    for (let c in this.tiles) {
      let tile = this.tiles[c]

      if (tile.enemies.length || tile.pawns.length || tile.item) {
        console.log(`<${c}>:`)

        if (tile.enemies.length) {
          let enemies = tile.enemies.map(x=>{
            for (let i=0; i<this._enemies.length; i++) {
              if (this._enemies[i].id === x)
                return ` ${this._enemies[i].name}x${this._enemies[i].amount}`
            }
          }) 
          console.log(`- Enemies:${enemies}`)
        }

        if (tile.pawns.length) {
          let pawns = tile.pawns.map(x=>' '+this._pawns[x].name+' ('+this._pawns[x].actions+')') 
          console.log(`- Pawns:${pawns}`)
        }

        if (tile.item) {
          console.log(`- Item: ${tile.items[i]}`)
        }

        console.log(``)
      }

    }
    console.log(`===============================================`)
  }

  pass() {
    let turn = this._turnCount
    for (let k in this.pawns) {
      this.act(k, 'wait')
      if (turn !== this._turnCount) break
    }
  }


}


/**
 * Representacoes:
 *
 * Mapa: (odd-r notation)
 * - tiles <>
 * - pawns <>
 * - enemies []
 * 
 * Tile:
 * - type
 *   - restrict bool
 *   - movementMod -1
 *
 * Pawn:
 * - type
 *   - movementModByTile
 *   - baseMovement
 *   - attackRange
 *   - attack
 *   - defense
 * - coord <Q, R>
 *
 * Enemy:
 * - type
 *   - movementModByTile
 *   - baseMovement
 *   - attack
 *   - defense
 * - coord <Q, R>
 * - amount
 *
 * 
 *
 *
 *
 * 
 */

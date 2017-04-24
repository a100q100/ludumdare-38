import Pawn from 'ld/board/Pawn'
import Tile from 'ld/board/Tile'
import Enemy from 'ld/board/Enemy'
import astar from 'ld/board/astar'
import * as utils from 'ld/board/utils'
import * as actions from 'ld/board/actions'

var ID = 0

export default class Board {
  constructor(data, width, height) {
    this._data = data

    this._tiles = null
    this._pawns = null
    this._enemies = null
    this._spawnPoints = null
    this._inventory = null
    this._actions = {}
    this._goals = null
    this._width = width
    this._height = height
    
    for (let k in actions) {
      this._actions[k] = new actions[k](this)
    }
  }

  get tiles() { return this._tiles }
  get spawnPoints() { return this._spawnPoints }
  get pawns() { return this._pawns }
  get inventory() { return this._inventory }
  get enemies() { return this._enemies }
  get goals() { return this._goals }

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

    // Set goal pickups
    for (let i=0; i<map.goals.length; i++) {
      let goal = map.goals[i]

      if (goal.type === 'pickup') {
        this.tiles[[goal.coord.q, goal.coord.r]].addItem(goal.object)
      }
    }

    this._goals = sk.utils.deepCopy(map.goals)

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

  positionToCoord(x, y) {
    let h3_4 = this._height*3/4
    let h_4 = this._height/4
    let w = this._width
    let w_2 = this._width/2

    let R = Math.floor(y/h3_4)
    let Q = Math.floor((x - (R&1)*w_2)/w)

    let dY = y - R*h3_4
    let dX = x - Q*w - (R&1)*w_2
    let c = h_4
    let m = c/w_2

    if (dY < -m*dX + c) {
      [Q, R] = utils.next([Q, R], 'NW')
    } else if (dY < m*dX - c) {
      [Q, R] = utils.next([Q, R], 'NE')
    }

    return {q:Q, r:R}
  }

  coordToPosition(q, r, center) {
    let x = q*this._width + (r&1)*this._width/2
    let y = r*this._height*.75

    if (center) {
      x += this._width/2
      y += this._height/2
    }

    return new PIXI.Point(x, y)
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

  canAct(id, action, target) {
    let pawn = this.pawns[id]
    action = this._actions[action]
    return action.canPerform(pawn, target)
  }

  act(id, action, target) {
    let log = []

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

    log = log.concat(action.perform(pawn, target))

    if (this._hasUserWin()) {
      log.push({
        type  : 'game.victory',
        count : this._turnCount
      })
      return log
    }

    if (this._isTurnEnded()) {
      log = log.concat(this._nextTurn())
    }

    return log
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
  _hasUserWin() {
    for (let i=0; i<this._goals.length; i++) {
      let goal = this._goals[i]

      if (goal.type === 'pickup' && this._inventory.indexOf(goal.object) < 0){
        return false
      }
      else if (goal.type === 'movement') {
        let tile = this.tiles[[goal.coord.q, goal.coord.r]]
        if (!tile.pawns.length) {
          return false
        }
      }
    }

    return true
  }
  _hasUserLose() {
    return !Object.keys(this.pawns).length
  }

  /**
   * Machine turn
   */
  _nextTurn() {
    let log = []

    this._turn = 'machine'
    log.push({
      type  : 'game.machineturn',
      count : this._turnCount
    })

    for (let i=0; i<this.enemies.length; i++) {
      this.enemies[i].resetActions()
    }
    
    log = log.concat(this._spawn())
    log = log.concat(this._moveEnemies())
    log = log.concat(this._attackHeroes())

    if (this._hasUserLose()) {
      log.push({
        type  : 'game.failure',
        count : this._turnCount
      })
      return log
    }

    this._initializePlayerTurn()
    // this.report()

    return log
  }
  _spawn() {
    let log = []

    for (let i=0; i<this._spawnPoints.length; i++) {
      let spawn = this._spawnPoints[i]

      let index = Math.floor(Math.random()*this._spawnDeck.length)
      let spec = this._spawnDeck.splice(index, 1)[0]
      let data = this._data.enemies[spec.enemy]

      let enemy = new Enemy(++ID, data, spawn, spec.amount)

      this.tiles[spawn].addEnemy(enemy.id)
      this._enemies.push(enemy)

      log.push({
        type   : 'enemy.spawn',
        target : spawn,
        enemy  : enemy
      })
      
      if (!this._spawnDeck.length) {
        console.log('reseting deck')
        this._spawnDeck = this._data.spawn[this._difficulty].slice()
      }
    }

    return log
  }
  _getEnemy(id) {
    for (let i=0; i<this._enemies.length; i++) {
      if (this._enemies[i].id === id) {
        return this._enemies[i]
      }
    }
  }

  _moveEnemies() {
    let log = []

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

        let lastCoord = enemy.coord
        currentTile.removeEnemy(enemy.id)
        targetTile.addEnemy(enemy.id)
        enemy.coord = target
        enemy.actions -= 1

        log.push({
          type  : 'enemy.movement',
          from  : lastCoord,
          to    : enemy.coord,
          enemy : enemy,
          pawn  : minTarget
        })
      }

      // Merge same type enemies
      let merge = []
      for (let t in this.tiles) {
        let tile = this.tiles[t]

        for (let i=tile.enemies.length-1; i>=0; i--) {
          let first = this._getEnemy(tile.enemies[i])

          for (let j=i-1; j>=0; j--) {
            let second = this._getEnemy(tile.enemies[j])
            // console.log('comparing', first.id, 'to', second.id, '...')
            if (first.type === second.type) {
              merge.push([first, second, tile])
              // console.log('merge!')
              break
            }
          }
        }
      }

      for (let i=0; i<merge.length; i++) {
        let from = merge[i][0]
        let to = merge[i][1]
        let tile = merge[i][2]
        let amount = from.amount

        // console.log('merging', from.id, 'and', to.id, from.type, ':', amount)
        // console.log('previous tile:')
        // for (let z=0; z<tile.enemies.length; z++) {
        //   console.log(tile.enemies[z])
        // }
        // console.log('previous board:')
        // for (let z=0; z<this.enemies.length; z++) {
        //   console.log(this.enemies[z])
        // }

        log.push({
          type   : 'enemy.merged',
          first  : from,
          second : to,
          amount : amount,
          coord  : to.coord
        })

        to.amount += from.amount
        tile.removeEnemy(from.id)
        this.enemies.splice(this.enemies.indexOf(from), 1)

        // console.log('after tile:')
        // for (let z=0; z<tile.enemies.length; z++) {
        //   console.log(tile.enemies[z])
        // }
        // console.log('after board:')
        // for (let z=0; z<this.enemies.length; z++) {
        //   console.log(this.enemies[z])
        // }
      }
    }

    return log
  }
  _attackHeroes() {
    let log = []

    let attacks = {}

    // Compute attacks from all enemies in the same tile
    for (let i=0; i<this._enemies.length; i++) {
      let enemy = this._enemies[i]

      if (!enemy.actions) continue
      let tile = this.tiles[enemy.coord]

      if (!tile.pawns.length) continue

      if (!attacks[enemy.coord]) attacks[enemy.coord] = 0

      let attack = utils.dice(enemy.attack)
      attacks[enemy.coord] += attack

      log.push({
        type   : 'enemy.attack',
        target : enemy.coord,
        damage : attack,
        enemy  : enemy,
        pawns  : tile.pawns.map(x => this._pawns[x])
      })
    }

    // Compute the combat
    for (let coord in attacks) {
      let attack = attacks[coord]

      // console.log('Enemies attacking with', attack)

      let pawns = this.tiles[coord].pawns.map(x => this._pawns[x])
      let defense = pawns.reduce((v, x) => v+utils.dice(x.defense), 0)

      log.push({
        type    : 'pawn.defense',
        damage  : attack,
        defense : defense,
        pawns   : pawns
      })
      // console.log('Pawns defending with', defense)

      if (attack > defense) {
        let dead = pawns[parseInt(Math.random()*pawns.length)]

        let tile = this.tiles[dead.coord]
        tile.removePawn(dead.id)

        let pawn = this.pawns[dead.id]
        delete this.pawns[dead.id]

        log.push({
          type    : 'pawn.killed',
          damage  : attack,
          defense : defense,
          pawn    : pawn
        })
        // console.log(dead.name, 'is dead')

        if (!Object.keys(this._pawns).length) return log
      }
    }

    return log
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
          console.log(`- Item: ${tile.item}`)
        }
      }
    }
    console.log(`===============================================`)
  }

  pass() {
    let log = []
    let turn = this._turnCount
    for (let k in this.pawns) {
      log = log.concat(this.act(k, 'wait'))
      if (turn !== this._turnCount) break
    }
    return log
  }

  printLog(log) {
    console.log(``)
    console.log(`LOG ==================================`)
    for (let i=0; i<log.length; i++) {
      let item = log[i]

      let s = ''
      
      if (item.count) s += ` <turn:${item.count}>`
      if (item.target) s += ` <coords:${item.target}>`
      if (item.item) s += ` <item:${item.item}>`
      if (item.damage) s += ` <damage:${item.damage}>`
      if (item.defense) s += ` <defense:${item.defense}>`
      if (item.pawn) s += ` <pawn:${item.pawn.name}>`
      if (item.enemy) s += ` <enemy:${item.enemy.name}>`

      console.log(`${item.type}:${s}`)
    }
    console.log(`===============================================`)
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

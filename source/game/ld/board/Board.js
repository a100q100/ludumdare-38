import Pawn from 'ld/board/Pawn'
import Tile from 'ld/board/Tile'
import * as utils from 'ld/board/utils'
import * as actions from 'ld/board/actions'


export default class Board {
  constructor(data) {
    this._types = data

    this._tiles = null
    this._pawns = null
    this._enemies = null
    this._spawnPoints = null
    this._actions = {}
    
    for (let k in actions) {
      this._actions[k] = new actions[k](this)
    }
  }

  get tiles() { return this._tiles }
  get spawnPoints() { return this._spawnPoints }
  get pawns() { return this._pawns }

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
      let data = this._types.tiles[tile.type]
      let coord = [tile.q, tile.r]

      this._tiles[coord] = new Tile(data, coord)
    }

    // Set pawns
    let initialCoord = [map.initial.q, map.initial.r]
    for (let k in heroes) {
      let data = this._types.heroes[heroes[k]]
      this._pawns[k] = new Pawn(data, initialCoord)

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
  getActions(pawnId) {
    let pawn = this._pawns[pawnId]

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

  getTargets(pawnId, action) {

    return this._actions[action].getPossibleTargets(pawnId)
  }

  act(pawnId, action, target) {
    if (!pawnId in this._pendingPawnIds) {
      console.error('Trying to perform an action in a pawn that don\'t have more actions')
    }
  }



  /**
   * Internal
   */
  _initializeGame() {
    this._turn = 'player'
    
    this._initializePlayerTurn()
  }
  _initializePlayerTurn() {
    // this._pendingActions = 
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



sk.scene({
  name: 'level',
  layers: [
    'background',
    'map',
    'tokens',
    'enemies',
    'pawns',
    'overlay',
    'hud'
  ],
  systems: [
    'button'
  ],
  eventSheets: [
    'level'
  ],
  initialize: function() {
    this._jobs = []
    this._places = {}

    // Methods
    this.job = function(duration, updateFn, completeFn, delay) {
      let job = new Job(this, duration, updateFn, completeFn, delay)
      this._jobs.push(job)
      return job
    }

    this.put = function(entity, coord) {
      if (!this._places[coord]) {
        this._places[coord] = {
          0: null,
          1: null,
          2: null,
          3: null,
          4: null,
          5: null,
          6: null,
        }
      }
      let places = this._places[coord]

      let empty = -1
      for (let i in places) {
        if (places[i] === null) {
          empty = i
          break
        }
      }

      places[empty] = entity
      let position = board.coordToPosition(coord[0], coord[1], true)

      let x = position.x
      let y = position.y
      let w = board._width
      let h = board._height
      let rx = Math.random()*6 -3
      let ry = Math.random()*6 -3

      if (empty == 0) return new PIXI.Point(x    +rx, y-h/4+ry)
      if (empty == 1) return new PIXI.Point(x+w/6+rx, y+h/6+ry)
      if (empty == 2) return new PIXI.Point(x-w/6+rx, y+h/6+ry)
      if (empty == 3) return new PIXI.Point(x-w/6+rx, y-h/6+ry)
      if (empty == 4) return new PIXI.Point(x    +rx, y    +ry)
      if (empty == 5) return new PIXI.Point(x+w/6+rx, y-h/6+ry)
      if (empty == 6) return new PIXI.Point(x    +rx, y+h/4+ry)
    }

    this.take = function(entity, coord) {
      if (!this._places[coord]) return
      let places = this._places[coord]
      for (let i in places) {
        if (places[i] === entity) {
          places[i] = null
          return
        }
      }
    }




    // Creating
    {
      // Background
      this.addStatic('sprite', 'background')
          .configure({
            texture: game.resources.get('background')
          })
      this.addStatic('sprite', 'background')
          .configure({
            texture: game.resources.get('menu_background')
          })

      // Map
      this._map = this.addEntity('map', 'map')
      this._map.loadMap()

      this._targets = this.addEntity('targets', 'overlay')

      this.offset = {x:-100, y:-120}
      this.layers['map'].position = this.offset
      this.layers['tokens'].position = this.offset
      this.layers['enemies'].position = this.offset
      this.layers['pawns'].position = this.offset
      this.layers['overlay'].position = this.offset


      // Map elements
      //   spawn points
      for (let i=0; i<board.spawnPoints.length; i++) {
        let point = board.spawnPoints[i]

        let position = board.coordToPosition(point[0], point[1], true)
        let sprite = this.addEntity('token', 'tokens')
        sprite.display.texture = game.resources.get('token_spawn')
        sprite.display.anchor = {x:.5, y:.5}
        sprite.display.position = position
      }

      //   goals
      this._items = {}
      for (let i=0; i<board.goals.length; i++) {
        let goal = board.goals[i]

        let position = board.coordToPosition(goal.coord.q, goal.coord.r, true)
        let sprite = this.addEntity('token', 'tokens')
        sprite.display.anchor = {x:.5, y:.5}
        sprite.display.position = position

        if (goal.type === 'pickup') {
          let id = goal.object
          sprite.display.texture = game.resources.get('token_item')
          this._items[id] = sprite
        } else {
          sprite.display.texture = game.resources.get('token_fort')
        }
      }

      //   pawns
      this._pawns = {}
      for (let k in board.pawns) {
        let pawn = board.pawns[k]
        let sprite = this.addEntity('pawn', 'pawns')
        sprite.display.anchor = {x:.5, y:.5}
        sprite.display.texture = game.resources.get(pawn.pawn)

        let position = this.put(sprite, pawn.coord)
        sprite.display.position = {
          x: position.x,
          y: position.y
        }

        this._pawns[k] = sprite
      }

      this._enemies = {}

      // HUD
      let y = 40
      this._hudPawns = {}
      this._hudActions = {}
      for (let k in board.pawns) {
        let pawn = board.pawns[k]

        // pawn button
        let button = this.addEntity('token', 'hud')
        button.display.texture = game.resources.get(pawn.icon)
        button.display.anchor = {x:.5, y:.5}
        button.display.x = 35
        button.display.y = y
        this._hudPawns[k] = button
        this._hudActions[k] = {}

        // pawn actions
        let actions = ['attack', 'movement', 'pickup', 'wait', 'cancel']
        let x = 90
        for (let i=0; i<actions.length; i++) {
          let action = this.addEntity('button', 'hud')
          action.display.anchor = {x:.5, y:.5}
          action.display.texture = game.resources.get('icon_'+actions[i])
          action.display.position = {x, y}
          action.display.alpha = 0
          this._hudActions[k][actions[i]] = action

          action.addEventListener('buttonclick', () => {
            this.eventSheets.level.selectAction(k, actions[i])
          })

          x += 5 + action.display.texture.width
        }

        y += 10 + button.display.texture.height
      }

      let helpButton = this.addEntity('button', 'hud')
      helpButton.display.texture = game.resources.get('icon_help')
      helpButton.display.anchor = {x:.5, y:.5}
      helpButton.display.x = 35
      helpButton.display.y = game.display.height-35
      helpButton.addEventListener('buttonclick', () => {
        window.openTutorial()
      })
    }

  },

  update: function(delta) {
    let jobs = this._jobs.slice()
    for (let i=0; i<jobs.length; i++) {
      jobs[i].update(delta)
    }
  },

  start: function() {
    this.eventSheets.level.startPlayerTurn()
  }


})


class Job {
  constructor(scene, duration, updateFn, completeFn, delay) {
    this._scene = scene
    this._duration = duration
    this._delay = delay
    this._updateFn = updateFn
    this._completeFn = completeFn

    this._isFinished = false
    this._remaining = duration
  }

  update(delta) {
    if (this._delay > 0) {
      this._delay -= delta*1000

      if (this._delay > 0) {
        return
      } else {
        this._remaining += this._delay
      }
    }



    this._remaining -= delta*1000
    if (this._remaining < 0) return this.finish()

    let th = 1 - (this._remaining/this._duration)

    if (this._updateFn) {
      this._updateFn(th)
    }
  }

  finish() {
    if (this._isFinished) return

    this._isFinished = true
    this._scene._jobs.splice(this._scene._jobs.indexOf(this), 1)

    if (this._completeFn) this._completeFn()
  }
}
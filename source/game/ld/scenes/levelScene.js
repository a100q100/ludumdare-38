

sk.scene({
  name: 'level',
  layers: [
    'background',
    'map',
    'tokens',
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

      this.layers['map'].x = -100
      this.layers['map'].y = -100
      this.layers['tokens'].x = -100
      this.layers['tokens'].y = -100
      this.layers['overlay'].x = -100
      this.layers['overlay'].y = -100


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
        let sprite = this.addEntity('pawn', 'tokens')
        sprite.display.anchor = {x:.5, y:.5}
        sprite.display.texture = game.resources.get(pawn.pawn)

        let position = board.coordToPosition(pawn.coord[0], pawn.coord[1], true)
        sprite.display.position = {
          x: position.x + Math.random()*40-20,
          y: position.y + Math.random()*40-20
        }

        this._pawns[k] = sprite
      }

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
    }

    // Methods
    this.job = function(duration, updateFn, completeFn, delay) {
      let job = new Job(this, duration, updateFn, completeFn, delay)
      this._jobs.push(job)
      return job
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
sk.eventSheet({
  name: 'level',

  events: {
    'game_turnstart': function() {
      console.log('start')
    },

    'mouseclick': function() {
      if (this.pawn === null && this.action === null) return

      let coord = board.positionToCoord(game.mouse.x+100, game.mouse.y+100)
      let target = [coord.q, coord.r]
      if (board.canAct(this.pawn, this.action, target)) {
        this.hideTargets()
        this.clearActions()
        let log = board.act(this.pawn, this.action, target)
        this.pawn = null
        this.action = null

        this.digestLog(log)
      }
    }
  },

  data: {
    pawn: null,
    action: null
  },

  methods: {
    startPlayerTurn() {

      this.updateActions()
    },

    selectAction: function(pawnId, action) {
      if (action === 'cancel') {
        this.pawn = null
        this.action = null
        this.hideTargets()
        this.updateActions()
      } else {
        let targets = board.getTargets(pawnId, action)

        if (targets === true) {
          let log = board.act(pawnId, action)
          this.digestLog(log)
        } else {
          this.pawn = pawnId
          this.action = action
          this.drawTargets(targets);
          this.updateActions()
        }
      }

    },

    updateActions: function() {
      let delay = 0

      // Enable/disable pawns
      for (let k in board.pawns) {
        let pawn = board.pawns[k]
        let icon = this.scene._hudPawns[k]

        if (pawn.actions) {
          icon.display.tint = 0xFFFFFF
          icon.display.alpha = 1
        } else {
          icon.display.tint = 0xa3a3a3
          icon.display.alpha = 0.5
        }
      }

      this.clearActions()

      // Show only available actions
      for (let k in board.pawns) {
        let pawn = board.pawns[k]
        let actions = this.scene._hudActions[k]

        // Actions
        if (this.pawn !== null && this.action !== null) {
          // show cancel
          if (this.pawn == k) {
            let button = actions['cancel']
            button.display.x = 90
            
            button.$hoverJob = this.scene.job(1000, function(th) {
              button.display.alpha = sk.utils.easing.cubicInOut(th)
            }, function() {
              button.display.alpha = 1
            })

          }

        } else {
          // show all available actions
          let allowed = board.getActions(k)

          let x = 90
          for (let i=0; i<allowed.length; i++) {
            let action = allowed[i]

            let button = actions[action]
            button.display.x = x
            x += button.display.width + 5
            
            button.$hoverJob = this.scene.job(1000, function(th) {
              let e = sk.utils.easing
              button.display.alpha = e.cubicInOut(th)
            }, function() {
              button.display.alpha = 1
            }, delay)

            delay += 100
          }
          
        }
      }
    },

    clearActions: function() {
      // Hide all actions
      for (let k in board.pawns) {
        let actions = this.scene._hudActions[k]
        for (let a in actions) {
          let button = actions[a]
          if (button.$hoverJob) button.$hoverJob.finish()
          button.display.alpha = 0
        }
      }
    },

    drawTargets: function(targets) {
      this.scene._targets.show(targets)

      if (this.scene._targets.$job) this.scene._targets.$job.finish()
      this.scene._targets.$job = this.scene.job(1000, (t) => {
        this.scene._targets.display.alpha = sk.utils.easing.elasticOut(t)
      })
    },

    hideTargets: function() {
      this.scene._targets.hide()

      if (this.scene._targets.$job) this.scene._targets.$job.finish()

      this.scene._targets.$job = this.scene.job(300, (t) => {
        this.scene._targets.display.alpha = 1-sk.utils.easing.cubicIn(t)
      })
    },

    digestLog: function(log) {
      let stack = log.slice()

      let next = () => {
        if (!stack.length) {
          return this.updateActions()
        }

        let item = stack.shift()
        if (item.type === 'pawn.movement') this.digestPawnMovement(item, next)
        else if (item.type === 'pawn.attack') this.digestPawnAttack(item, next)
        else if (item.type === 'pawn.defense') this.digestPawnDefense(item, next)
        else if (item.type === 'pawn.killed') this.digestPawnKilled(item, next)
        else if (item.type === 'pawn.pickup') this.digestPawnPickup(item, next)
        else if (item.type === 'pawn.wait') this.digestPawnWait(item, next)
        else if (item.type === 'enemy.defense') this.digestEnemyDefense(item, next)
        else if (item.type === 'enemy.killed') this.digestEnemyKilled(item, next)
        else if (item.type === 'enemy.movement') this.digestEnemyMovement(item, next)
        else if (item.type === 'enemy.attack') this.digestEnemyAttack(item, next)
        else if (item.type === 'enemy.spawn') this.digestEnemySpawn(item, next)
        else if (item.type === 'enemy.damaged') this.digestEnemyDamaged(item, next)
        else if (item.type === 'game.victory') this.digestGameVictory(item, next)
        else if (item.type === 'game.failure') this.digestGameFailure(item, next)
        else if (item.type === 'game.machineturn') this.digestGameMachineturn(item, next)
        else if (item.type === 'game.playerturn') this.digestGamePlayerturn(item, next)
      }

      next()
    },

    digestPawnMovement: function(item, next) {
      let id = item.pawn.id
      let pawn = this.scene._pawns[id]
      let position = board.coordToPosition(item.to[0], item.to[1], true)
      let target = {
        x: position.x + Math.random()*40 -20,
        y: position.y + Math.random()*40 -20
      }
      let diff = {
        x: target.x - pawn.display.x,
        y: target.y - pawn.display.y
      }
      let initial = {
        x: pawn.display.x,
        y: pawn.display.y
      }
      
      this.scene.job(1000, 
        function update(th) {
          pawn.display.x = initial.x + sk.utils.easing.cubicIn(th)*diff.x
          pawn.display.y = initial.y + sk.utils.easing.elasticOut(th)*diff.y
        }, 
        function complete() {
          pawn.display.x = target.x
          pawn.display.y = target.y
          next()
        }
      )
    },
    digestPawnAttack: function(item, next) { next() },
    digestPawnDefense: function(item, next) { next() },
    digestPawnKilled: function(item, next) { next() },
    digestPawnPickup: function(item, next) { next() },
    digestPawnWait: function(item, next) { 
      let id = item.pawn.id
      let pawn = this.scene._pawns[id]
      
      this.scene.job(300, 
        function update(th) {
          pawn.display.rotation = Math.sin(th*2*Math.PI)/2
        }, 
        function complete() {
          pawn.display.rotation = 0
          next()
        }
      )
    },
    digestEnemyDefense: function(item, next) { next() },
    digestEnemyKilled: function(item, next) { next() },
    digestEnemyMovement: function(item, next) { next() },
    digestEnemyAttack: function(item, next) { next() },
    digestEnemySpawn: function(item, next) { next() },
    digestEnemyDamaged: function(item, next) { next() },
    digestGameVictory: function(item, next) { next() },
    digestGameFailure: function(item, next) { next() },
    digestGameMachineturn: function(item, next) { next() },
    digestGamePlayerturn: function(item, next) { next() },
  }
})
sk.eventSheet({
  name: 'level',

  events: {
    'game_turnstart': function() {
      // console.log('start')
    },

    'mouseclick': function() {
      if (this.pawn === null && this.action === null) return

      let coord = board.positionToCoord(game.mouse.x-this.scene.offset.x, game.mouse.y-this.scene.offset.y)
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
          this.clearActions()
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
            
            button.$hoverJob = this.scene.job(500, function(th) {
              let e = sk.utils.easing
              button.display.alpha = e.cubicOut(th)
            }, function() {
              button.display.alpha = 1
            }, delay)

            delay += 50
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
        if (!item) return next()

        console.log(item)
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
        else if (item.type === 'enemy.merged') this.digestEnemyMerged(item, next)
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

      this.scene.take(pawn, item.from)
      let target = this.scene.put(pawn, item.to)

      let diff = {
        x: target.x - pawn.display.x,
        y: target.y - pawn.display.y
      }
      let initial = {
        x: pawn.display.x,
        y: pawn.display.y
      }
      
      this.scene.job(600, 
        function update(th) {
          th = sk.utils.easing.cubicInOut(th)
          pawn.display.x = initial.x + th*diff.x
          pawn.display.y = initial.y + th*diff.y
        }, 
        function complete() {
          pawn.display.x = target.x
          pawn.display.y = target.y
          next()
        }
      )
    },
    digestPawnAttack: function(item, next) { 
      let id = item.pawn.id
      let pawn = this.scene._pawns[id]
      let position = board.coordToPosition(item.target[0], item.target[1], true)
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
      
      let going = true
      this.scene.job(1000, 
        function update(th) {
          if (th < 0.5) {
            th = sk.utils.easing.cubicInOut(th*2)

            pawn.display.x = initial.x + th*diff.x
            pawn.display.y = initial.y + th*diff.y
          } else {
            th = sk.utils.easing.cubicInOut((th-0.5)*2)

            if (going) {
              going = false
              target = initial
              initial = {x: pawn.display.x, y: pawn.display.y}
              diff = {
                x: target.x - pawn.display.x,
                y: target.y - pawn.display.y
              }
            }
            pawn.display.x = initial.x + th*diff.x
            pawn.display.y = initial.y + th*diff.y
          }

        }, 
        function complete() {
          pawn.display.x = target.x
          pawn.display.y = target.y
          next()
        }
      )
    },
    digestPawnDefense: function(item, next) { 
      let id = item.pawns[parseInt(Math.random()*item.pawns.length)].id
      let pawn = this.scene._pawns[id]
      let x = pawn.display.x
      
      this.scene.job(300, 
        function update(th) {
          pawn.display.x = x + Math.sin(th*6*Math.PI)*5
        }, 
        function complete() {
          pawn.display.x = x
          next()
        }
      )
    },
    digestPawnKilled: function(item, next) {
      let id = item.pawn.id
      let pawn = this.scene._pawns[id]
      this.scene.take(pawn, item.pawn.coord)
      
      let diff = 0xFFFFFF - 0xE24545
      this.scene.job(1000, 
        th => {
          pawn.display.tint = 0xFFFFFF - diff*th
          pawn.display.alpha = 1-sk.utils.easing.cubicInOut(th)
        }, 
        () => {
          // this.scene.removeEntity(pawn, 'enemies')
          next()
        }
      )
    },
    digestPawnPickup: function(item, next) {
      let pawn = this.scene._pawns[item.pawn.id]
      let pick = this.scene._items[item.item]
      let y = pawn.display.y
      this.scene.job(300, 
        function update(th) {
          th = sk.utils.easing.cubicInOut(th)
          pick.display.alpha = 1-th
          pawn.display.y = y + Math.sin(th*Math.PI)*7
        }, 
        function complete() {
          pick.display.alpha = 0
          pawn.display.y = y
          next()
        }
      )
    },
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
    digestEnemyDefense: function(item, next) { 
      let id = item.enemy.id
      let enemy = this.scene._enemies[id]
      let x = enemy.display.x
      
      this.scene.job(300, 
        function update(th) {
          enemy.display.x = x + Math.sin(th*6*Math.PI)*5
        }, 
        function complete() {
          enemy.display.x = x
          enemy.text.text = item.enemy.amount
          next()
        }
      )
    },
    digestEnemyKilled: function(item, next) { 
      let id = item.enemy.id
      let enemy = this.scene._enemies[id]
      this.scene.take(enemy, item.enemy.coord)
      
      let diff = 0xFFFFFF - 0xE24545
      this.scene.job(400, 
        th => {
          enemy.display.tint = 0xFFFFFF - diff*th
          enemy.display.alpha = 1-sk.utils.easing.cubicInOut(th)
        }, 
        () => {
          this.scene.removeEntity(enemy, 'enemies')
          next()
        }
      )
      
    },
    digestEnemyMovement: function(item, next) {
      let id = item.enemy.id
      let enemy = this.scene._enemies[id]

      this.scene.take(enemy, item.from)
      let target = this.scene.put(enemy, item.to)

      let diff = {
        x: target.x - enemy.display.x,
        y: target.y - enemy.display.y
      }
      let initial = {
        x: enemy.display.x,
        y: enemy.display.y
      }
      
      this.scene.job(600, 
        function update(th) {
          th = sk.utils.easing.cubicInOut(th)
          enemy.display.x = initial.x + th*diff.x
          enemy.display.y = initial.y + th*diff.y
        }, 
        function complete() {
          enemy.display.x = target.x
          enemy.display.y = target.y
          next()
        }
      )
    },
    digestEnemyAttack: function(item, next) {
      let id = item.enemy.id
      let enemy = this.scene._enemies[id]
      let position = board.coordToPosition(item.target[0], item.target[1], true)
      let target = {
        x: position.x + Math.random()*40 -20,
        y: position.y + Math.random()*40 -20
      }
      let diff = {
        x: target.x - enemy.display.x,
        y: target.y - enemy.display.y
      }
      let initial = {
        x: enemy.display.x,
        y: enemy.display.y
      }
      
      let going = true
      this.scene.job(1000, 
        function update(th) {
          if (th < 0.5) {
            th = sk.utils.easing.cubicInOut(th*2)

            enemy.display.x = initial.x + th*diff.x
            enemy.display.y = initial.y + th*diff.y
          } else {
            th = sk.utils.easing.cubicInOut((th-0.5)*2)

            if (going) {
              going = false
              target = initial
              initial = {x: enemy.display.x, y: enemy.display.y}
              diff = {
                x: target.x - enemy.display.x,
                y: target.y - enemy.display.y
              }
            }
            enemy.display.x = initial.x + th*diff.x
            enemy.display.y = initial.y + th*diff.y
          }

        }, 
        function complete() {
          enemy.display.x = target.x
          enemy.display.y = target.y
          next()
        }
      )
    },
    digestEnemySpawn: function(item, next) {
      let id = item.enemy.id
      let enemy = this.scene.addEntity('enemy', 'enemies')
      let target = this.scene.put(enemy, item.target)

      enemy.sprite.texture = game.resources.get(item.enemy.image)
      enemy.text.text = item.enemy.amount
      enemy.display.position = target
      enemy.display.scale.x = 0.3
      enemy.display.scale.y = 0.3
      enemy.display.alpha = 0
            
      this.scene._enemies[id] = enemy
      
      this.scene.job(300, 
        function update(th) {
          th = sk.utils.easing.elasticOut(th)
          enemy.display.alpha = th
          enemy.display.scale.x = 0.3 + th*0.7
          enemy.display.scale.y = 0.3 + th*0.7
        }, 
        function complete() {
          enemy.display.alpha = 1
          enemy.display.scale.x = 1
          enemy.display.scale.y = 1
          next()
        }
      )
    },
    digestEnemyDamaged: function(item, next) { 
      let enemy = this.scene._enemies[item.enemy.id]
      enemy.text.text = item.enemy.amount
      next()
    },
    digestEnemyMerged: function(item, next) {
      let first = this.scene._enemies[item.first.id]
      let second = this.scene._enemies[item.second.id]
      second.text.text = item.second.amount
      this.scene.take(first, item.first.coord)
      this.scene.removeEntity(first, 'enemies')

      this.scene.job(500, 
        th => {
          th = sk.utils.easing.cubicInOut(th)
          let s = Math.abs(Math.sin(th*Math.PI))*0.3
            
          second.display.scale.x = 1 + s
          second.display.scale.y = 1 + s
        }, 
        () => {
          second.display.scale.x = 1
          second.display.scale.y = 1
          next()
        }
      )
    },
    digestGameVictory: function(item, next) { 
      window.alert('You Won!')
      next()
      game.scenes.play('character', new sk.transitions.FadeInOut(1000))
    },
    digestGameFailure: function(item, next) { 
      window.alert('You lose =(!')
      next()
      game.scenes.play('character', new sk.transitions.FadeInOut(1000))
    },
    digestGameMachineturn: function(item, next) { next() },
    digestGamePlayerturn: function(item, next) { next() },
  }
})
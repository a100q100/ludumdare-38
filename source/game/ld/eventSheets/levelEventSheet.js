sk.eventSheet({
  name: 'level',

  events: {
    'game_turnstart': function() {
      console.log('start')
    },

    'mouseclick': function() {
      console.log('scene click')
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

    digestLog: function(log) {

    },

    selectAction: function(pawnId, action) {
      if (action === 'cancel') {
        this.pawn = null
        this.action = null
      } else {
        let target = board.getTargets(pawnId, action)

        if (target === true) {
          let log = board.act(pawnId, action)
          this.digestLog(log)
        } else {
          this.pawn = pawnId
          this.action = action
        }
      }

      this.updateActions()
    },

    updateActions: function() {
      let delay = 0

      // Hide all actions
      for (let k in board.pawns) {
        let actions = this.scene._hudActions[k]
        for (let a in actions) {
          let button = actions[a]
          if (button.$hoverJob) button.$hoverJob.finish()
          button.display.alpha = 0
        }
      }

      // Show only available actions
      for (let k in board.pawns) {
        let pawn = board.pawns[k]
        let actions = this.scene._hudActions[k]


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
    }
  }
})
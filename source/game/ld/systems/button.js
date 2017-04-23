sk.system({
  name: 'button',
  check: function(entity) {
    return entity.has('button')
  },

  update: function(delta, entities) {
    for (let i=entities.length-1; i>=0; i--) {
      let entity = entities[i]
      let button = entity.c.button

      if (entity.display.alpha === 0) continue

      if (entity.display.containsPoint(game.mouse.position)) {
        
        if (!button.over)  {
          game.events.dispatch('buttonenter', entity)
          this.enter(entity)
        }        
        game.events.dispatch('buttonover', entity)
        button.over = true


        if (game.mouse.isPressed(sk.BUTTON.LEFT)) {
          button.down = true
          game.events.dispatch('buttonclick', entity)
        }

        if (game.mouse.isUp(sk.BUTTON.LEFT)) {
          button.down = false
        }

      }

      else if (button.over) {
        game.events.dispatch('buttonleave', entity)
        this.leave(entity)
        button.over = false
        button.down = false
      }
    }
  },

  methods: {
    enter: function(entity) {
      if (!entity.display.alpha) return

      if (entity.$hoverJob) entity.$hoverJob.finish()

      entity.$hoverJob = this.scene.job(
        300,
        function(th) {
          let ease = sk.utils.easing.cubicOut
          entity.display.scale.x = entity.display.scale.y = 1 + ease(th)*0.1
          entity.display.alpha = 1-ease(th)*0.1
        },
        function() {  
          entity.display.scale = {x: 1.1, y: 1.1}
          entity.display.alpha = 0.9
        }
      )
    },
    leave: function(entity) {
      if (!entity.display.alpha) return
      if (entity.$hoverJob) entity.$hoverJob.finish()

      entity.$hoverJob = this.scene.job(
        300,
        function(th) {
          let ease = sk.utils.easing.cubicIn
          entity.display.scale.x = entity.display.scale.y = 1.1 - ease(th)*0.1
          entity.display.alpha = 0.9+ease(th)*0.1
        },
        function() {
          entity.display.scale = {x: 1, y: 1}
          entity.display.alpha = 1
        }
      )
    },
  }
})
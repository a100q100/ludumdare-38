

sk.scene({
  name: 'intro',
  layers: [
    'background',
    'items',
  ],
  systems: [
    'button'
  ],
  initialize: function() {
    this._jobs = []

    // Methods
    this.job = function(duration, updateFn, completeFn, delay) {
      let job = new Job(this, duration, updateFn, completeFn, delay)
      this._jobs.push(job)
      return job
    }

    // Background
    this.addStatic('sprite', 'background')
        .configure({
          texture: game.resources.get('background')
        })

    this.title = new sk.displayObjects.Text('Small World', {fill:0x333333})
                      .configure({
                        anchor : {x:.5, y:.5},
                        x      : game.display.halfWidth,
                        y      : 200,
                        alpha  : 0
                      })
    this.subtitle = new sk.displayObjects.Text('ludumdare #38', {fontSize: 20, fill:0x333333})
                      .configure({
                        anchor : {x:.5, y:.5},
                        x      : game.display.halfWidth,
                        y      : 230,
                        alpha  : 0
                      })

    this.authorTitle = new sk.displayObjects.Text('by', {fontSize: 20, fill:0x333333})
                      .configure({
                        anchor : {x:.5, y:.5},
                        x      : game.display.halfWidth,
                        y      : 350,
                        alpha  : 0
                      })

    this.author = new sk.displayObjects.Text('Renato Pereira', {fontSize: 22, fill:0x333333})
                      .configure({
                        anchor : {x:.5, y:.5},
                        x      : game.display.halfWidth,
                        y      : 380,
                        alpha  : 0
                      })

    this.addStatic(this.title)
    this.addStatic(this.subtitle)
    this.addStatic(this.authorTitle)
    this.addStatic(this.author)
  },

  update: function(delta) {
    let jobs = this._jobs.slice()
    for (let i=0; i<jobs.length; i++) {
      jobs[i].update(delta)
    }
  },

  start: function() {

    console.log('here')
    this.job(1000, th => this.title.alpha = sk.utils.easing.quadInOut(th), () => {
      this.job(1000, th => this.title.alpha = 1-sk.utils.easing.quadInOut(th), null, 1000)
    })
    this.job(1000, th => this.subtitle.alpha = sk.utils.easing.quadInOut(th), () => {
      this.job(1000, th => this.subtitle.alpha = 1-sk.utils.easing.quadInOut(th), null, 1000)
    }, 100)
    this.job(1000, th => this.authorTitle.alpha = sk.utils.easing.quadInOut(th), () => {
      this.job(1000, th => this.authorTitle.alpha = 1-sk.utils.easing.quadInOut(th), null, 1000)
    }, 200)
    this.job(1000, th => this.author.alpha = sk.utils.easing.quadInOut(th), () => {
      this.job(1000, th => this.author.alpha = 1-sk.utils.easing.quadInOut(th), () => {
        game.scenes.play('character', new sk.transitions.FadeIn(500))
      }, 1500)
    }, 300)
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
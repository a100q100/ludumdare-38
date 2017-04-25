

sk.scene({
  name: 'character',
  layers: [
    'background',
    'items',
  ],
  systems: [
    'button'
  ],
  initialize: function() {
    if (window.localStorage) {
      if (!window.localStorage.getItem('tutorial')) {
        window.localStorage.setItem('tutorial', true)
        window.openTutorial()
      }
    }



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


    // elements
    this.title = new sk.displayObjects.Text('Select 2 characters', {fontSize: 22, fill:0x333333})
    .configure({
      anchor : {x:.5, y:.5},
      x      : game.display.halfWidth,
      y      : 60
    })
    this.addStatic(this.title)

    let heroes = game.resources.get('data_heroes')
    this._buttons = []
    this._heroes = []

    let size = Object.keys(heroes).length
    let padding = (100/size)
    let area = size*75 + (size-1)*padding
    let x = game.display.halfWidth - area/2
    let names = shuffle(Object.keys(heroes))
    for (let i=0; i<names.length; i++) {
      let name = names[i]
      let data = heroes[names[i]]
      let button = this.addEntity('button')
      button.display.texture_real = game.resources.get(data.avatar)
      button.display.texture = game.resources.get('avatar_hidden')
      button.display.anchor = {x:.5, y:.5},
      button.display.x = x
      button.display.y = game.display.halfHeight
      button.__id__ = name

      x += padding + 88

      button.addEventListener('buttonclick', () => {
        if (this._heroes.length >= 2 || this._heroes.indexOf(name) >= 0) return

        this._heroes.push(name)
        let finished = this._heroes.length === 2
        let going = true

        this.job(800,
          th=>{
            th = sk.utils.easing.quadOut(th)
            if (th < 0.5 && going) {
              button.display.alpha = 1-(th*2)
            } else {
              if (going) {
                going = false
                // button.display.tint=0xFFFFFF
                button.display.texture = button.display.texture_real
              }

              button.display.alpha = ((th-.5)*2)
            }
          },
          ()=>{
            button.display.alpha = 1
          }
        )

        if (finished) {
          this.finish()
        }
      })


      this._buttons.push(button)
    }

    this.finish = function() {

      this.job(500, 
        th => {
          th = sk.utils.easing.circIn(th)
          this.title.alpha = 1-th
        },
        () => {
          this.title.alpha = 0
        }
      , 400)

      let delay = 0
      for (let i=this._buttons.length-1; i>=0; i--) {
        let button = this._buttons[i]
        
        let extraDelay = 0
        if (this._heroes.indexOf(this._buttons[i].__id__) >= 0) {
          extraDelay = (size)*200 + 100
        }
        
        this.job(500, 
          th => {
            th = sk.utils.easing.circIn(th)
            button.display.alpha = 1-th
          },
          () => {
            button.display.alpha = 0
            if (i===0) {

              // this.job(1000, (th) => {
              //   for (let z=0; z<this._buttons.length; z++) {
              //     if (this._heroes.indexOf(this._buttons[z].__id__) >= 0) {
              //       this._buttons[z].display.alpha = Math.sin(th*4*Math.PI)
              //     }
              //   }
              // }, () => {
              // board.loadMap(game.resources.get('map_01'), this._heroes)

              // game.scenes.play('level', new sk.transitions.FadeIn(1000))
                
              // })
              setTimeout(()=> {
                board.loadMap(game.resources.get('map_01'), this._heroes)

                game.scenes.play('level', new sk.transitions.FadeIn(1000))
              }, 500)
            }
          }
        , delay+extraDelay)

        if (this._heroes.indexOf(this._buttons[i].__id__) < 0) {
          delay += 200
        }
      }
    }

  },

  update: function(delta) {
    let jobs = this._jobs.slice()
    for (let i=0; i<jobs.length; i++) {
      jobs[i].update(delta)
    }
  },
})


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



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
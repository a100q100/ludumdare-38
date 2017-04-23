
sk.entity({
  name: 'targets',
  display: 'graphics',

  initialize: function() {
    this.show = function(targets) {
      this.display.clear()
      for (let i=0; i<targets.length; i++) {
        let target = targets[i]
        let p = board.coordToPosition(target[0], target[1], true)


        let h_2 = board._height/2
        let h_4 = board._height/4
        let w_2 = board._width/2

        let path = [
          p.x,     p.y-h_2,
          p.x+w_2, p.y-h_4,
          p.x+w_2, p.y+h_4,
          p.x,     p.y+h_2,
          p.x-w_2, p.y+h_4,
          p.x-w_2, p.y-h_4,
          p.x,     p.y-h_2
        ]
        
        this.display
          .beginFill(0xF0E200, 0.4)
          .lineStyle(3, 0xF0E200, 0.9)
          .drawPolygon(path)
          .endFill()
      }
    }
    this.hide = function() {
    }
  }
})
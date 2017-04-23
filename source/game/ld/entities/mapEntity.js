sk.entity({
  name       : 'map',
  display    : 'container',
  initialize : function() {

    this.loadMap = function() {
      let minX = 9999
      let maxX = -9999
      let minY = 9999
      let maxY = -9999
      let containerBackground = new PIXI.Container()
      let containerForeground = new PIXI.Container()

      for (let k in board.tiles) {
        let tile = board.tiles[k]

        let position = board.coordToPosition(tile.coord[0], tile.coord[1])
        if (position.x < minX) minX = position.x
        if (position.x > maxX) maxX = position.x
        if (position.y < minY) minY = position.y
        if (position.y > maxY) maxY = position.y

        let sprite1 = new sk.displayObjects.Sprite(game.resources.get('tile_grass'))
        sprite1.configure({position: position})

        let texture = game.resources.get(tile.image)
        let sprite2 = new sk.displayObjects.Sprite(texture)
        sprite2.configure({position: position})

        // this.display.addChild(sprite)
        containerBackground.addChild(sprite1)
        containerForeground.addChild(sprite2)
      }

      let position = {
        x: -(maxX-minX),
        y: -(maxY-minY),
      }

      // Blured background
      containerBackground.filters = [new PIXI.filters.BlurFilter(40, 20)]
      // containerBackground.position = {x:position.x, y:position.y}
      containerBackground.cacheAsBitmap = true
      this.display.addChild(containerBackground)

      // containerForeground.position = position
      containerForeground.cacheAsBitmap = true
      this.display.addChild(containerForeground)
    }
  }
})
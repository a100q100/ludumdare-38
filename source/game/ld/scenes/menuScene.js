

sk.scene({
  name: 'menu',
  layers: [
    'background',
    'items',
  ],
  systems: [
    'button'
  ],
  initialize: function() {
    // Background
    this.addStatic('sprite', 'background')
        .configure({
          texture: game.resources.get('background')
        })
  }
})

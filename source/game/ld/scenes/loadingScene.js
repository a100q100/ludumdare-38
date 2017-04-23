
sk.scene({
  name: 'loading',
  initialize: function() {
    this.addStatic('text')
        .configure({
          text: 'Loading...',
          position: {
            x: game.display.width/2,
            y: game.display.height/2,
          },
          anchor: {
            x: 0.5,
            y: 0.5
          }
        })
  }
})
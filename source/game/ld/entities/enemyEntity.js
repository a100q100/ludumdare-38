sk.entity({
  name    : 'enemy',
  display : 'container',
  initialize: function() {
    this.sprite = new PIXI.Sprite()
    this.ribbon = new PIXI.Graphics()
    this.text = new PIXI.Text('', {fontSize: 15, fill:0xD3E2DD})

    this.display.addChild(this.sprite)
    this.display.addChild(this.ribbon)
    this.display.addChild(this.text)

    this.sprite.anchor = {x:.5, y:.5}

    this.ribbon
      .beginFill(0x131313)
      // .beginFill(0xE24545)
      // .lineStyle(1, 0xE24545)
      .drawRoundedRect(-20, 15, 40, 20, 10)
      .endFill()

    this.text.text = ''
    this.text.anchor.x = 0.5
    this.text.anchor.y = 0.5
    this.text.y = 25

  }
})
import {config} from 'config.js'
import {manifest} from 'manifest.js'
import {engine} from 'engine.js'

import * as ld from 'ld'

let game = new sk.Game(config, manifest)
global.game = game

game.scenes.play('loading')
game.addEventListener('resourcecomplete', function() {
  let board = new ld.Board({
    tiles: game.resources.get('data_tiles'),
    heroes: game.resources.get('data_heroes'),
    enemies: game.resources.get('data_enemies'),
    spawn: game.resources.get('data_spawn')
  },
    86,
    101
  )
  global.board = board

  board.loadMap(
    game.resources.get('map_01'),
    ['human_warrior', 'human_mage']
  )

  game.scenes.play('intro', new sk.transitions.FadeInOut(500))
})

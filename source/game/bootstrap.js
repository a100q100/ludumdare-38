import * as ld from 'ld'

import {config} from 'config.js'
import {manifest} from 'manifest.js'


let game = new sk.Game(config, manifest)
global.game = game

game.addEventListener('resourcecomplete', function() {
  let board = new ld.Board({
    tiles: game.resources.get('data_tiles'),
    heroes: game.resources.get('data_heroes'),
    enemies: game.resources.get('data_enemies'),
    spawn: game.resources.get('data_spawn')
  })
  global.board = board

  board.loadMap(
    game.resources.get('map_01'),
    ['dwarf_warrior', 'elf_ranger']
  )
})

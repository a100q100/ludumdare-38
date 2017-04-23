export default class Pawn {
  constructor(id, data, coord) {
    this.id = id
    this.type = data.type
    this.image = data.image
    this.icon = data.icon
    this.avatar = data.avatar
    this.name = data.name
    this.title = data.title
    this.pawn = data.pawn
    this.totalActions = 2
    this.totalExtraAction = data.extraAction
    this.movementMods = sk.utils.deepCopy(data.movementMods)
    this.attack = data.attack
    this.defense = data.defense
    this.range = data.range

    this.coord = coord

    this.actions = this.totalActions
    this.extraActions = this.totalExtraAction? 1: 0
  }

  resetActions() {
    this.actions = this.totalActions
    this.extraActions = this.totalExtraAction? 1: 0
  }
}
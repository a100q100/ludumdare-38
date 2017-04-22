export default class Pawn {
  constructor(data, coord) {
    this.id = data.id
    this.name = data.name
    this.title = data.title
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
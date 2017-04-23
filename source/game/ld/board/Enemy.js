export default class Enemy {
  constructor(id, data, coord, amount) {
    this.id = id
    this.coord = coord
    this.name = data.name
    this.movement = data.movement
    this._attack = data.attack
    this.image = data.image
    this.defense = data.defense
    this.priority = data.priority
    this.amount = amount
    this.actions = 0
  }

  get attack() {
    if (this._attack === 'amount') {
      return this.amount
    }

    return this._attack
  }

  resetActions() {
    this.actions = 1
  }
}
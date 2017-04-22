export function dice(n) {
  return Math.round(Math.random()*n)
}

const dirs = [
  {NW:[-1, -1], NE:[0, -1], W:[-1, 0], E:[1, 0], SW:[-1, 1], SE:[0, 1]}, // event
  {NW:[0, -1], NE:[1, -1], W:[-1, 0], E:[1, 0], SW:[0, 1], SE:[1, 1]} // odd
]
export function next(coord, dir) {
  let mod = dirs[coord[1]&1][dir]
  return [coord[0]+mod[0], coord[1]+mod[1]]
}

export function neighboors(coord, range=1) {
  let result = []
  
  let Q = coord[0]
  let R = coord[1]

  let pivot = [Q-parseInt( (range + Math.abs((R&1) - 1))/2 ), R-range]

  let distance = 0
  for (let d=range; range>=0; range--) {
    let r = pivot[1]
    for (let i=0; i<=d+distance; i++) {
      let q = pivot[0]+i

      if (q === Q && r === R) continue

      result.push([q, r])
      if (r !== R) {
        result.push([q, 2*R-r])
      }
    }

    distance += 1
    pivot = next(pivot, 'SW')
  }

  return result
}

/**
 * Distance from A to B
 */
export function distance(a, b) {
  let vertical = a[1]-b[1] > 0 ? 'N' : 'S'
  let horizontal = a[0]-b[0] > 0 ? 'W' : 'E'
  let dir = vertical+horizontal
  let distance = 0

  let point = a
  while (point[1] !== b[1]) {
    distance += 1
    point = next(point, dir)
  }

  distance += Math.abs(point[0]-b[0])

  return distance
}

/** dir from a to b */
export function direction(a, b) {
  let vertical = a[1]-b[1] > 0 ? 'N' : 'S'
  let horizontal = a[0]-b[0] > 0 ? 'W' : 'E'

  if (b[1] === a[1]) return horizontal

  return vertical+horizontal
}
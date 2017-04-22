export function dice(n) {
  return Math.round(Math.random()*n)
}

export function next(coord, dir) {
  const dirs = [
    {NW:[-1, -1], NE:[0, -1], W:[-1, 0], E:[1, 0], SW:[-1, 1], SE:[0, 1]}, // event
    {NW:[0, -1], NE:[1, -1], W:[-1, 0], E:[1, 0], SW:[0, 1], SE:[1, 1]} // odd
  ]

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

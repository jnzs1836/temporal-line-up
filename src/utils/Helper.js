export function linspace (minimum, maximum, count) {
  const step = (maximum - minimum) / count
  const result = []
  for (let p = minimum, i = 0; i < count; i++) {
    result.push([
      p,
      p + step
    ])
    p += step
  }
  console.log(result)
  return result
}

export function randomString () {
  return '_' + Math.random().toString(36).slice(2)
}

export function pull (array, elem) {
  const pos = array.indexOf(elem)
  if (pos >= 0) {
    array.splice(pos, 1)
  }
}

// export function shadeColor (color, percent) {
//   var R = parseInt(color.substring(1, 3), 16)
//   var G = parseInt(color.substring(3, 5), 16)
//   var B = parseInt(color.substring(5, 7), 16)

//   R = parseInt(R * (100 + percent) / 100)
//   G = parseInt(G * (100 + percent) / 100)
//   B = parseInt(B * (100 + percent) / 100)

//   R = (R < 255) ? R : 255
//   G = (G < 255) ? G : 255
//   B = (B < 255) ? B : 255

//   var RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16))
//   var GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16))
//   var BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16))

//   return '#' + RR + GG + BB
// }

export function addColorOpacity (color, ratio) {
  const R = parseInt(color.substring(1, 3), 16)
  const G = parseInt(color.substring(3, 5), 16)
  const B = parseInt(color.substring(5, 7), 16)
  return `rgba(${R}, ${G}, ${B}, ${ratio})`
}

export function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

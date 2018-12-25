import _ from 'lodash'
// import Vue from 'vue'

// import { randomString } from './Helper'

const INITIAL_COLUMN_WIDTH = 140
const INITIAL_WEIGHT = 10;
const INITIAL_ROW_HEIGHT = 80
const INITIAL_VERTICAL_ROW_HEIGHT = 80
export const lambda = 0.75;
export function defaultNormalizer (c) {
  if(c === -1){
    return lambda;
  }
  if (!c[this.key]) {
    return 0
  }
  return this.maximum === this.minimum
    ? lambda
    :lambda* (c[this.key] - this.minimum) / (this.maximum - this.minimum)
}

export function reversedNormalizer (c) {
  if(c === -1){
    return lambda;
  }
  if (!c[this.key]) {
    return 0
  }
  return this.maximum === this.minimum
    ? 1
    : (this.maximum - c[this.key]) / (this.maximum - this.minimum)
}

export function paddedNormalizer (c) {
  if(c === -1){
    return lambda;
  }
  if (!c[this.key]) {
    return 0.2
  }
  console.log(this.maximum);
  console.log(c[this.key]);
  console.log(this.maximum);
  return this.maximum === this.minimum
    ? lambda
    : lambda *0.2 + lambda * (c[this.key] - this.minimum) / (this.maximum - this.minimum)
}

export function paddedReversedNormalizer (c) {
  if(c === -1){
    return lambda;
  }
  if (!c[this.key]) {
    return 0.2
  }
  return this.maximum === this.minimum
    ? 1
    : 0.2 + 0.8 * (this.maximum - c[this.key]) / (this.maximum - this.minimum)
}

// export function createDynamicNormalizer () {
//   return function (c) {
//     const value = this.getter(c).value
//     if (!value) {
//       return 0
//     } else {
//       if (value > this.minimum)
//       const nv = normalizerFn.call()
//     }
//   }
// }

export function defaultUpdater (c) {
  if (c[this.key] > this.maximum) {
    this.maximum = c[this.key]
    // this.maximumValue = c[this.key]
  }
  if (c[this.key] < this.minimum) {
    this.minimum = c[this.key]
    // this.minimumValue = c[this.key]
  }
}

export function absoluteUpdater (c) {
  if (c[this.key] > this.maximum) {
    this.maximum = c[this.key]
    // this.maximumValue = c[this.key]
  }
  this.minimum = 0
  // if (!this.minimumValue || c[this.key] < this.minimumValue) {
  //   this.minimumValue = c[this.key]
  //   this.minimumValue = c[this.key]
  // }
}

export function defaultGetter (c) {
  // console.log("------------------------");
  // console.log(c)
  // console.log(this.key);
  return {
    value: c[this.key].toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export function rawGetter (c) {
  return {
    value: c[this.key]
  }
}

// export function createDynamicGetter ({ dirtyFn, updateFn }) {
//   const results = {}
//   return function (c) {
//     if (dirtyFn.call(this, c)) {
//       const sessionKey = randomString()
//       Vue.set(results, c.key, {
//         value: null,
//         key: sessionKey
//       });
//       (async () => {
//         const value = await updateFn.call(this, c)
//         if (results[c.key].key === sessionKey) {
//           results[c.key].value = value
//           results[c.key].pending = false
//         }
//       })()
//     }
//     return results[c.key]
//   }
// }

export const AttributeType = Object.freeze({
  CONTINUOUS: 'CONTINUOUS',
  ORDINAL: 'ORDINAL'
})

export function createAttribute (attr) {
  return _.defaults(attr, {
    type: AttributeType.CONTINUOUS,
    width: INITIAL_COLUMN_WIDTH,
    height: INITIAL_ROW_HEIGHT,
    verticalHeight:INITIAL_VERTICAL_ROW_HEIGHT,
    hidden: false,
    maximum: -Infinity,
    minimum: Infinity,
    sorted: false,
    group: null,
    // cluster: null,
    updater: defaultUpdater,
    normalizer: defaultNormalizer,
    getter: defaultGetter,
    filter: null,
    weight:INITIAL_WEIGHT
  })
}

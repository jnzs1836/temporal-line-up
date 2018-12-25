import _ from 'lodash'

import { AttributeType } from '../utils/AttributeModifier'
import { csn } from '../utils/Formatter'
import { linspace } from '../utils/Helper'

export class AttributeFilterOption {
  attr = null
  range = null
  candidates = null

  styles = {
    borderLeft: 0,
    borderRight: 0,
    left: 0,
    width: 0,
    height: 0,
    shadow: 1
  }

  constructor (attr, range, candidates) {
    this.attr = attr
    if (range.length) {
      this.range = range
    } else {
      this.range = [range, range + 1e-5]
    }

    const test = c => c[this.attr.key] >= this.range[0] &&
                      c[this.attr.key] < this.range[1]
    this.candidates = _.filter(candidates, test)
  }

  setStyles (width, step, i, max) {
    this.styles.borderLeft = step * i
    this.styles.borderRight = step * (i + 1)
    this.styles.left = step * i + (step - width) / 2 + 0.008
    this.styles.width = width - 0.016
    this.styles.height = this.candidates.length / max
  }

  updateShadow (filter) {
    this.styles.shadow = _.filter(this.candidates, filter).length / this.candidates.length
  }
}

export class AttributeFilter {
  _range = [0, 1]

  maximumValue = -Infinity
  minimumValue = Infinity
  maximumOptionCandidate = 0
  options = null
  attr = null

  constructor (attr) {
    this.attr = attr
  }

  initialize (candidates) {
    this._range = [0, 1]

    if (!candidates.length) {
      this.maximumValue = 0
      this.minimumValue = 0
      this.maximumOptionCandidate = 0
      this.options = []
    } else {
      this._computeMinMaxValue(candidates)
      this.options = _.map(
        this.discretizedValueRange,
        r => new AttributeFilterOption(this.attr, r, candidates)
      )
      this.maximumOptionCandidate = _.maxBy(
        this.options, 'candidates.length'
      ).candidates.length

      const step = 1 / this.options.length
      const width = Math.min(step, 0.15)
      _.each(
        this.options,
        (opt, i) => opt.setStyles(width, step, i, this.maximumOptionCandidate)
      )
    }
  }

  _computeMinMaxValue (candidates) {
    if (candidates.length === 0) {
      this.maximumValue = 0
      this.minimumValue = 0
      return
    }

    this.maximumValue = -Infinity
    this.minimumValue = Infinity
    _.each(
      candidates,
      c => {
        const value = c[this.attr.key]
        if (value < this.minimumValue) {
          this.minimumValue = value
        }
        if (value > this.maximumValue) {
          this.maximumValue = value
        }
      }
    )
    if (this.continuous) {
      this.maximumValue += 1e-5
    } else {
      this.minimumValue -= 0.5
      this.maximumValue += 0.5
    }
  }

  valueAt (p) {
    return p * (this.maximumValue - this.minimumValue) + this.minimumValue
  }

  updateShadow (filter) {
    _.each(this.options, opt => opt.updateShadow(filter))
  }

  get range () {
    return this._range
  }

  set range (r) {
    if (r[0] >= r[1]) {
      return
    }
    r[0] = Math.max(r[0], 0)
    r[1] = Math.min(r[1], 1)
    this._range = r
  }

  get discretizedValueRange () {
    return this.continuous
      ? linspace(this.minimumValue, this.maximumValue + 1e-5, 8)
      : _.range(Math.ceil(this.minimumValue), this.maximumValue)
  }

  get continuous () {
    return this.attr.type === AttributeType.CONTINUOUS
  }

  get pristine () {
    return this.range[0] === 0 && this.range[1] === 1
  }

  get valueRange () {
    return [this.valueAt(this.range[0]), this.valueAt(this.range[1])]
  }

  set valueRange (vr) {
    this.range = [
      (vr[0] - this.minimumValue) / (this.maximumValue - this.minimumValue),
      (vr[1] - this.minimumValue) / (this.maximumValue - this.minimumValue)
    ]
  }

  get testFunc () {
    const range = this.valueRange
    return c => c[this.attr.key] >= range[0] && c[this.attr.key] < range[1]
  }

  get descriptor () {
    const range = this.valueRange
    return {
      name: this.continuous
        ? `${this.attr.name}: ${csn(range[0])} ~ ${csn(range[1])}`
        : `${this.attr.name}: ${
            _.range(Math.ceil(range[0]), range[1]).join(', ')
          }`,
      fn: c => c[this.attr.key] >= range[0] && c[this.attr.key] < range[1]
    }
  }
}

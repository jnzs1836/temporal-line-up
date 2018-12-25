import _ from 'lodash'

import { FilterForcedWidth } from '../store/modules/RankingStore'

export class AttributeGroup {
  _width = 0
  attrs = []

  constructor (attr) {
    if (attr.length) {
      this.attrs = attr
      this.takeOwnership(attr)
    } else {
      this.attrs.push(attr)
      this._width = attr.width
    }
  }

  prependGroup (group) {
    this.attrs[0].hidden = true
    this.attrs = _.concat(group.attrs, this.attrs)
    this.takeOwnership(group.attrs)
  }

  appendGroup (group) {
    group.attrs[0].hidden = true
    this.attrs = _.concat(this.attrs, group.attrs)
    this.takeOwnership(group.attrs)
  }

  removeAttribute (attr) {
    /* eslint-disable no-new */
    const pos = this.attrs.indexOf(attr)

    if (pos !== 0) {
      new AttributeGroup(this.attrs.slice(0, pos))
    }
    if (pos !== this.attrs.length - 1) {
      this.attrs[pos + 1].hidden = false
      new AttributeGroup(this.attrs.slice(pos + 1))
    }

    attr.hidden = false
    attr.group = null
  }

  takeOwnership (attrs) {
    for (let attr of attrs) {
      attr.group = this
      this._width += attr.width
    }
  }

  get width () {
    return this._width + 12 * (this.attrs.length - 1)
  }

  get filteringWidth () {
    return FilterForcedWidth * this.attrs.length + 12 * (this.attrs.length - 1)
  }

  get children () {
    return this.attrs.slice(1)
  }
}

import _ from 'lodash'

export class CandidateClusterNode {
  parent = null
  left = null
  right = null
  nodeKey = null
  min = +Infinity
  max = -Infinity
  count = 0

  constructor (left, right, key) {
    this.nodeKey = key
    this.left = left
    this.right = right

    this.count += this.left
      ? (this.left.nodeKey ? this.left.count : 1)
      : 0
    this.count += this.right
      ? (this.right.nodeKey ? this.right.count : 1)
      : 0

    const leftRange = this._getNodeMinMax(left)
    const rightRange = this._getNodeMinMax(right)
    this.min = Math.min(leftRange[0], rightRange[0])
    this.max = Math.max(leftRange[1], rightRange[1])
  }

  _getNodeMinMax (node) {
    if (node) {
      if (node.nodeKey) {
        return [node.min, node.max]
      } else {
        return [node[this.nodeKey], node[this.nodeKey]]
      }
    }
    return [+Infinity, -Infinity]
  }

  get size () {
    return this.max - this.min
  }

  get root () {
    return this.parent ? this.parent.root : this
  }

  get value () {
    return this.min + 0.5 * this.size
  }

  get leftValue () {
    return this.left.nodeKey ? this.left.value : this.left[this.nodeKey]
  }

  get rightValue () {
    return this.right
      ? (this.right.nodeKey ? this.right.value : this.right[this.nodeKey])
      : this.leftValue
  }
}

export class CandidateCluster {
  candidates = null
  nodeKey = null
  root = null
  groups = []
  partitions = []
  positions = []

  constructor (candidates, key, count) {
    this.candidates = _.sortBy(candidates, key)
    this.nodeKey = key
    this.count = count || 5

    this.cluster()
    this.findGroups()
    this.generatePartitions()
  }

  cluster () {
    let dists = []
    let clusters = _.clone(this.candidates)

    for (let i = 0; i < this.candidates.length - 1; i++) {
      dists.push([i, this.candidates[i + 1][this.nodeKey] - this.candidates[i][this.nodeKey]])
    }
    dists = _.sortBy(dists, d => d[1])

    for (let d of dists) {
      if (clusters[d[0]].nodeKey) {
        clusters[d[0]] = clusters[d[0]].root
      }
      if (clusters[d[0] + 1].nodeKey) {
        clusters[d[1] + 1] = clusters[d[0] + 1].root
      }

      const n = new CandidateClusterNode(
        clusters[d[0]],
        clusters[d[0] + 1],
        this.nodeKey
      )

      if (clusters[d[0]].nodeKey) {
        clusters[d[0]].parent = n
      }
      if (clusters[d[0] + 1].nodeKey) {
        clusters[d[1] + 1].parent = n
      }

      clusters[d[0]] = n
      clusters[d[0] + 1] = n
    }

    this.root = clusters[0].root
  }

  getNodeMin (node) {
    return node.nodeKey
      ? node.leftValue
      : node[this.nodeKey]
  }

  getNodeMax (node) {
    return node.nodeKey
      ? node.rightValue
      : node[this.nodeKey]
  }

  findGroups () {
    this.groups.push(this.root)
    for (let i = 1; i < this.count; i++) {
      let max = null
      let maxp = -1
      for (let j = 0; j < this.groups.length; j++) {
        if (this.groups[j].nodeKey &&
            this.groups[j].leftValue !== this.groups[j].rightValue &&
            (!max || this.groups[j].size > max.size)) {
          max = this.groups[j]
          maxp = j
        }
      }
      if (!max) {
        break
      } else {
        if (!max.right) {
          this.groups.splice(maxp, 1, max.left)
        } else {
          this.groups.splice(maxp, 1, max.left, max.right)
        }
      }
    }
  }

  generatePartitions () {
    this.positions = [0]

    const min = this.minimum
    const max = this.maximum
    const size = max - min

    let prevStop
    for (let i = 0; i < this.groups.length; i++) {
      const nmax = this.getNodeMax(this.groups[i])

      let start = i === 0 ? 0 : prevStop
      let span = (nmax - min) / size
      let stop = i === this.groups.length - 1
        ? 1
        : span + 0.5 * (this.getNodeMin(this.groups[i + 1]) - nmax) / size
      prevStop = stop

      this.partitions.push({
        start,
        stop,
        count: this.groups[i].nodeKey ? this.groups[i].count : 1,
        group: this.groups[i]
      })
      this.positions.push(stop)
    }
  }

  this.minimum (r) {
    const min = this.minimum
    return r * (this.maximum - min) + min
  }

  get minimum () {
    return this.getNodeMin(this.groups[0])
  }

  get maximum () {
    return this.getNodeMax(this.groups[this.groups.length - 1])
  }
}

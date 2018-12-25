import _ from 'lodash'
import Vue from 'vue'
import * as d3 from 'd3'

import {
  ADD_CANDIDATE,
  SET_CANDIDATES,
  SORT_CANDIDATES,
  TOGGLE_ATTRIBUTE_GROUPING,
  RESIZE_ATTRIBUTE,
  REMOVE_ATTRIBUTE,
  RESTORE_ATTRIBUTE,
  TOGGLE_RANKING_FILTER,
  SET_ATTRIBUTE_FILTER_RANGE,
  APPLY_ATTRIBUTE_FILTER,
  COMMIT_ATTRIBUTE_FILTER,
  SELECT_ATTRIBUTE_FILTER_OPTION,
  DELETE_CANDIDATE_FILTER,
  RESET_ATTRIBUTE_FILTERS,
  ADD_CANDIDATE_FILTER,
  APPLY_CANDIDATE_FILTERS,
  RESET_ATTRIBUTE_FILTER,
  RESET_ATTRIBUTE_SORTING,
  HIGHLIGHT_CANDIDATE,
  REMOVE_CANDIDATE,
  ADD_CANDIDATE_ATTRIBUTE,
  INITIALIZE_CANDIDATE_ATTRIBUTE,
  UPDATE_CANDIDATE_ATTRIBUTE,
  RESET_WEIGHT, ADD_CANDIDATE_PLAN,
  CHANGE_COMPARISON_MODAL_VISIBILITY, MERGE_PLAN_CANDIDATE, REMOVE_CANDIDATE_PLAN,
  UPDATE_ATTRIBUTES
} from '../MutationTypes'
import { AttributeGroup } from '../../types/AttributeGroup'
import { createAttribute, absoluteUpdater, paddedNormalizer, reversedNormalizer, paddedReversedNormalizer, rawGetter, AttributeType } from '../../utils/AttributeModifier'
import { AttributeFilter } from '../../types/AttributeFilter'
import eventBus from '../../utils/EventBus'
// import { sleep } from '../../utils/Helper'

const state = {
  allCandidates: [],
  candidates: [],
  filteredCandidates: null,
  removedCandidateKeys: new Set(['unit_price']),
  comparisonModalVisibility:false,
  mergingPlan:null,
  candidateAttributes: [
    // createAttribute({
    //   name: 'Continuity',
    //   desc: 'The grade calculated by the continuity algorithm',
    //   key: 'grade',
    //   normalizer: paddedNormalizer
    // }),
    // createAttribute({
    //   name: 'Score',
    //   type: AttributeType.ORDINAL,
    //   desc: 'score of algorithm evaluation',
    //   key: 'grade',
    //   updater: absoluteUpdater,
    //   getter: rawGetter,
    //   normalizer: paddedNormalizer
    // }),
    createAttribute({
      name: 'Vertex Coverage',
      type: AttributeType.ORDINAL,
      desc: 'Evaluation of vertex coverage',
      key: 'vertexCoverRatio',
      updater: absoluteUpdater,
      getter: rawGetter,
      normalizer: paddedNormalizer
    }),
    createAttribute({
      name: 'Trajectory Coverage',
      type: AttributeType.ORDINAL,
      desc: 'Trajectory covered by our plan',
      key: 'coverageTrajectory',
      updater: absoluteUpdater,
      getter: rawGetter,
      normalizer: paddedNormalizer
    }),
    createAttribute({
      name: 'Medical',
      type: AttributeType.ORDINAL,
      desc: 'scores of medical service',
      key: 'coverageMedicalService',
      updater: absoluteUpdater,
      getter: rawGetter,
      normalizer: paddedNormalizer
    }),
    createAttribute({
      name: 'Education',
      type: AttributeType.ORDINAL,
      desc: 'the education poi coveage',
      key: 'coverageEducationCulture',
      updater: absoluteUpdater,
      getter: rawGetter,
      normalizer: paddedNormalizer
    }),
    createAttribute({
      name: 'Shopping',
      type: AttributeType.ORDINAL,
      desc: 'scores for shopping',
      key: 'coverageShopping',
      updater: absoluteUpdater,
      normalizer:paddedNormalizer,
      getter: rawGetter
    }),
    createAttribute({
      name: 'Daily Life',
      type: AttributeType.ORDINAL,
      desc: 'evaluation of daily life convenience',
      key: 'coverageDailyLifeService',
      updater: absoluteUpdater,
      normalizer: paddedNormalizer,
      getter: rawGetter
    }),
    createAttribute({
      name: 'Real Estate',
      type: AttributeType.ORDINAL,
      desc: 'evaluation of real estate like houses',
      key: 'coverageRealEstate',
      updater: absoluteUpdater,
      normalizer: paddedNormalizer,
      getter: rawGetter
    }),
    createAttribute({
      name: 'G&NGO',
      type: AttributeType.ORDINAL,
      desc: 'Government and NGO',
      key: 'coverageGovernmentNonGovernmentOrganization',
      updater: absoluteUpdater,
      normalizer: paddedNormalizer,
      getter: rawGetter
    }),
    createAttribute({
      name: 'Food&Beverage',
      type: AttributeType.ORDINAL,
      desc: 'Evaluation of restaurants and cafes',
      key: 'coverageFoodBeverage',
      updater: absoluteUpdater,
      normalizer: paddedNormalizer,
      getter: rawGetter
    }),
    createAttribute({
      name: 'Company',
      type: AttributeType.ORDINAL,
      desc: 'Company coverage',
      key: 'coverageCompanyFactory',
      updater: absoluteUpdater,
      normalizer: paddedNormalizer,
      getter: rawGetter
    }),

     createAttribute({
      name: 'Public Transportation',
      type: AttributeType.ORDINAL,
      desc: 'Evaluation of other public transportation',
      key: 'coverageTransportation',
      updater: absoluteUpdater,
      normalizer: paddedNormalizer,
      getter: rawGetter
    }),
  ],

  removedAttributes: [
    createAttribute({
      name: 'Unit Price',
      desc: 'RMB / sq m',
      key: 'tourismCoverage',
      normalizer: paddedReversedNormalizer
    })
  ],

  sortingAttribute: null,

  showFilter: false,
  filters: {},

  highlightedCandidate: null
}

const getters = {
  allCandidates: state => state.allCandidates,
  candidates: state => state.candidates,
  filteredCandidates: state => state.filteredCandidates,
  candidateAttributes: state => state.candidateAttributes,
  sortingAttribute: state => state.sortingAttribute,
  removedAttributes: state => state.removedAttributes,
  comparisonModalVisibility:state=>state.comparisonModalVisibility,
  mapVisibility:state=>!state.comparisonModalVisibility,
  rankingShowFilter: state => state.showFilter,
  rankingFilters: state => state.filters,
  candidatesForVisualization:state=>state.candidates,
  highlightedCandidate: state => state.highlightedCandidate,
  getCandidatePlan:state=>key=>{
    for(let candidate of state.candidates){
      if(candidate.key === key ){
        return candidate;
      }
    }
    return null;
  },
  getMergedSequence:(state)=>(planKeys)=>{
    let plans = planKeys.map((value)=>{
      for(let plan of state.candidates){
        if(plan.key == value){
          return plan;
          break;
        }
      }
    });
    let mutualEdges = [];
    let candidateEdges = [];
    let left = [];
    for( let plan of plans){
      for(let edge of plan.expansionSequence){
        if(candidateEdges.indexOf(edge)<0){
            candidateEdges.push(edge);
        }
      }
    }
    for(let edge of candidateEdges){
      let flag = 1;
      for(let plan of plans){
        if(plan.expansionSequence.indexOf(edge) < 0){
          flag = 0;
          break;
        }
      }
      if(flag === 1){
        mutualEdges.push(edge);
      }else{
        left.push(edge);
      }

    }
    let exclude = [];
    for(let plan of plans){
      let tmp = []
      for(let edge of plan.expansionSequence){
        if(mutualEdges.indexOf(edge) < 0){
          tmp.push(edge);
        }
      }
      exclude.push(tmp);
    }
    exclude.push(left);
    return {mutual:mutualEdges,exclude:exclude};

  }
};

const mutations = {
  [UPDATE_ATTRIBUTES](state,{plan}){
    for(let attr of state.candidateAttributes){
      if(attr.maximum < plan[attr.key]){
        attr.maximum = plan[attr.key]
      }
      if(attr.minimum > plan[attr.key]){
        attr.minimum = plan[attr.key];
      }
    }
  },
  [REMOVE_CANDIDATE_PLAN](state,{planKey}){
    let planNeedRemovingSeq = -1;
    for(let planSeq in state.candidates){
      console.log(planSeq);
      if(state.candidates[planSeq].key === planKey){
        planNeedRemovingSeq = planSeq;
        break;
      }
    }
    if(planNeedRemovingSeq < 0){
      console.log("Not removed");
    }else {
      console.log(planNeedRemovingSeq);
      console.log(state.candidates)
      state.candidates.splice(planNeedRemovingSeq,1);
      console.log(state.candidates)
      // console.log(state.candidates.splice(planNeedRemovingSeq,1))
    }
  },
  [CHANGE_COMPARISON_MODAL_VISIBILITY](state,{visibility}){
    state.comparisonModalVisibility = visibility
  },
  [ADD_CANDIDATE_PLAN](state,candidate){
    let candidateGet = _.cloneDeep(candidate);
    _.each(state.candidateAttributes, attr => attr.updater(candidateGet));
    state.candidates.push(candidateGet);
    state.allCandidates.push(candidateGet);

  },
  [ADD_CANDIDATE] (state,candidate){
    let candidateGet = _.cloneDeep(candidate);
    _.each(state.candidateAttributes, attr => attr.updater(candidateGet));
    candidateGet.showTemporalSequence = false;
    state.candidates.push(candidateGet);
    state.allCandidates.push(candidateGet)
    for(let attr of state.candidateAttributes){
      if(attr.maximum < candidateGet[attr.key]){
        attr.maximum = candidateGet[attr.key]
      }
      if(attr.minimum > candidateGet[attr.key]){
        attr.minimum = candidateGet[attr.key];
      }
    }
  },
  [SET_CANDIDATES] (state, candidates) {
    state.allCandidates = _.clone(candidates)
    state.candidates = _.clone(candidates)

    _.each(
      candidates,
      c => _.each(state.candidateAttributes, attr => attr.updater(c))
    )
  },

  [REMOVE_CANDIDATE] (state, candidate) {
    if (!candidate) {
      state.removedCandidateKeys = new Set()
    } else {
      state.removedCandidateKeys.add(candidate.key)
      // _.pull(state.candidates, candidate)
      // if (state.filteredCandidates) {
      //   _.pull(state.filteredCandidates, candidate)
      // }
    }
  },

  [INITIALIZE_CANDIDATE_ATTRIBUTE] (state, attr) {
    attr.maximum = 0
    attr.minimum = 0
    _.each(state.allCandidates, c => Vue.set(c, attr.key, 0))
  },

  [UPDATE_CANDIDATE_ATTRIBUTE] (state, attr) {
    attr.minimum = Infinity
    attr.maximum = -Infinity
    _.each(
      state.candidates,
      c => attr.updater(c)
    )
    if (attr.filter) {
      attr.filter.initialize(state.candidates)
    }
  },

  [ADD_CANDIDATE_ATTRIBUTE] (state, attr) {
    state.candidateAttributes.push(attr)
  },

  [SORT_CANDIDATES] (state, attr) {
    let skipFlagResetting = false
    if (!attr) {
      attr = state.sortingAttribute
      if (!attr.group) {
        return
      }
      skipFlagResetting = true
    } else {
      state.sortingAttribute = attr
      attr.sorted = true
    }

    let keys = [ attr ]

    if (attr.group) {
      keys = attr.group.attrs
      if (!skipFlagResetting) {
        for (let i = 0; i < state.candidateAttributes.length; i++) {
          if (state.candidateAttributes[i].group !== attr.group) {
            state.candidateAttributes[i].sorted = false
          } else {
            state.candidateAttributes[i].sorted = true
          }
        }
      }
    } else {
      for (let i = 0; i < state.candidateAttributes.length; i++) {
        if (state.candidateAttributes[i] !== attr) {
          state.candidateAttributes[i].sorted = false
        }
      }
    }

    for (let c of state.candidates) {
      c.aggregated = 0
      for (let key of keys) {
        c.aggregated += key.normalizer(c) * key.width
      }
    }

    state.candidates = _.sortBy(state.candidates, c => -c.aggregated)
  },

  [RESET_ATTRIBUTE_SORTING] (state) {
    if (state.sortingAttribute) {
      if (state.sortingAttribute.group) {
        for (let attr of state.sortingAttribute.group.attrs) {
          attr.sorted = false
        }
      } else {
        state.sortingAttribute.sorted = false
      }
      state.sortingAttribute = null
    }
  },

  [TOGGLE_ATTRIBUTE_GROUPING] (state, attr) {
    if (attr.group) {
      attr.group.removeAttribute(attr)
    } else {
      attr.group = new AttributeGroup(attr)

      const pos = state.candidateAttributes.indexOf(attr)
      if (pos !== 0 && state.candidateAttributes[pos - 1].group) {
        attr.group.prependGroup(state.candidateAttributes[pos - 1].group)
      }
      if (pos !== state.candidateAttributes.length - 1 &&
          state.candidateAttributes[pos + 1].group) {
        attr.group.appendGroup(state.candidateAttributes[pos + 1].group)
      }
    }
  },

  [RESIZE_ATTRIBUTE] (state, { attr, delta, isVertical }) {
    if(isVertical==null){
      if (attr.width + delta < 40) {
        return
      }
      attr.width += delta
      if (attr.group) {
        attr.group._width += delta
      }
    }else{
      if (attr.height + delta < 40) {
        return
      }
      attr.height += delta
      if (attr.group) {
        attr.group._height += delta
      }
    }

  },
  // [RESET_WEIGHT](state,{attr,delta}){
  //   if (attr.weight + delta < 40) {
  //     return
  //   }
  //   attr.weigh += delta
  //   if (attr.group) {
  //     attr.group._weight += delta
  //   }
  // },

  [REMOVE_ATTRIBUTE] (state, attr) {
    if (attr.group) {
      attr.group.removeAttribute(attr)
    }

    const pos = state.candidateAttributes.indexOf(attr)
    state.candidateAttributes.splice(pos, 1)
    state.removedAttributes.push(attr)
  },

  [RESTORE_ATTRIBUTE] (state, attr) {
    state.candidateAttributes.push(attr)
    const pos = state.removedAttributes.indexOf(attr)
    state.removedAttributes.splice(pos, 1)
  },

  [TOGGLE_RANKING_FILTER] (state) {
    if (state.showFilter) {
      state.showFilter = false
    } else {
      state.showFilter = true
      state.filteredCandidates = state.candidates

      _.each(
        state.candidateAttributes,
        attr => {
          attr.filter = new AttributeFilter(attr)
          attr.filter.initialize(state.candidates)
        }
      )
    }
  },

  [SET_ATTRIBUTE_FILTER_RANGE] (state, { attr, range }) {
    attr.filter.range = range
  },

  [APPLY_ATTRIBUTE_FILTER] (state) {
    const allFn = _(state.candidateAttributes)
      .filter(attr => !attr.filter.pristine)
      .map(attr => attr.filter.testFunc)
      .value()
    const testFn = c => _.every(allFn, fn => fn(c))

    _.each(
      state.candidateAttributes,
      attr => attr.filter.updateShadow(testFn)
    )
    state.filteredCandidates = _.filter(
      state.candidates,
      testFn
    )
  },

  [RESET_ATTRIBUTE_FILTER] (state, attr) {
    attr.filter.initialize(state.candidates)
  },

  [RESET_ATTRIBUTE_FILTERS] (state) {
    state.filteredCandidates = state.candidates
    _.each(
      state.candidateAttributes,
      attr => attr.filter.initialize(state.candidates)
    )
  },

  [COMMIT_ATTRIBUTE_FILTER] (state, attr) {
    const desc = attr.filter.descriptor
    Vue.set(state.filters, attr.key, desc)
  },

  [ADD_CANDIDATE_FILTER] (state, { key, name, fn, deleteFn }) {
    Vue.set(state.filters, key, { name, fn, deleteFn })
  },

  [SELECT_ATTRIBUTE_FILTER_OPTION] (state, { attr, id }) {
    attr.filter.valueRange = _.clone(attr.filter.options[id].range)
  },

  [DELETE_CANDIDATE_FILTER] (state, key) {
    if (state.filters[key] && state.filters[key].deleteFn) {
      if (!state.filters[key].deleteFn()) {
        return
      }
    }
    Vue.delete(state.filters, key)
  },

  [APPLY_CANDIDATE_FILTERS] (state) {
    if (_.size(state.filters) === 0) {
      state.candidates = _.clone(state.allCandidates)
    } else {
      const allFn = _.map(state.filters, 'fn')
      const testFn = c => _.every(allFn, fn => fn(c))

      state.candidates = _.filter(
        state.allCandidates,
        testFn
      )
    }
  },

  [HIGHLIGHT_CANDIDATE] (state, candidate) {
    state.highlightedCandidate = candidate
    if (candidate) {
      const pos = state.candidates.indexOf(candidate)
      if (pos >= 0) {
        state.candidates.splice(pos, 1)
      } else {
        _.each(
          state.candidateAttributes,
          attr => attr.updater(candidate)
        )
      }
      state.candidates.unshift(candidate)
    }
  }
}

const actions = {
  async mergeCandidates({commit,dispatch},{mergedPlan,planKey1,planKey2}){
    commit(REMOVE_CANDIDATE_PLAN,{planKey:planKey1});
    commit(REMOVE_CANDIDATE_PLAN,{planKey:planKey2});
    dispatch("addCandidate",mergedPlan);
  },
  async addCandidate({commit,dispatch},candidate){
    commit(ADD_CANDIDATE,candidate);
    await dispatch('drawCandidates');
  },
  async setCandidates ({ commit, dispatch }, candidates) {
    commit(SET_CANDIDATES, candidates);
    await dispatch('drawCandidates');
  },

  async toggleAttributeGrouping ({ commit }, attr) {
    commit(RESET_ATTRIBUTE_SORTING);
    commit(TOGGLE_ATTRIBUTE_GROUPING, attr)
  },

  async removeAttribute ({ commit }, attr) {
    commit(RESET_ATTRIBUTE_SORTING);
    commit(REMOVE_ATTRIBUTE, attr)
  },

  async restoreAttribute ({ commit }, attr) {
    commit(RESTORE_ATTRIBUTE, attr)
    commit(UPDATE_CANDIDATE_ATTRIBUTE, attr)
  },

  async moveAttributeFilterRange ({ state, commit, dispatch }, { left, attr, delta }) {
    commit(SET_ATTRIBUTE_FILTER_RANGE, {
      attr,
      range: [
        attr.filter.range[0] + (left ? delta : 0),
        attr.filter.range[1] + (left ? 0 : delta)
      ]
    })
  },

  async commitAttributeFilter ({ commit, dispatch }, attr) {
    commit(COMMIT_ATTRIBUTE_FILTER, attr)
    await dispatch('applyCandidateFilters')
  },

  async addCandidateFilter ({ commit, dispatch }, { key, name, fn, deleteFn }) {
    commit(ADD_CANDIDATE_FILTER, { key, name, fn, deleteFn })
    await dispatch('applyCandidateFilters')
  },

  async deleteCandidateFilter ({ commit, dispatch }, key) {
    commit(DELETE_CANDIDATE_FILTER, key)
    await dispatch('applyCandidateFilters')
  },

  async applyAttributeFilter ({ commit, dispatch }, attr) {
    commit(APPLY_ATTRIBUTE_FILTER, attr)
    await dispatch('drawCandidates')
  },

  async resetAttributeFilter ({ commit, dispatch }, attr) {
    commit(RESET_ATTRIBUTE_FILTER, attr)
    commit(APPLY_ATTRIBUTE_FILTER, attr)
    await dispatch('drawCandidates')
  },

  async applyCandidateFilters ({ state, commit, dispatch }) {
    commit(APPLY_CANDIDATE_FILTERS)
    if (state.showFilter) {
      commit(RESET_ATTRIBUTE_FILTERS)
    }
    _.each(state.candidateAttributes, attr => {
      commit(UPDATE_CANDIDATE_ATTRIBUTE, attr)
    })
    await dispatch('drawCandidates')
  },

  async drawCandidates ({ commit, state, rootGetters, dispatch }) {
    const overlay = rootGetters.candidateOverlay
    const candidates = state.showFilter
      ? state.filteredCandidates : state.candidates
    const { selection, projection } = overlay

    if (rootGetters.visibleOverlay !== overlay) {
      console.log('redrawing candidates skipped due to invisibility')
      return
    }

    console.log('redrawing candidates...')
    if (state.highlightedCandidate && state.candidates.indexOf(state.highlightedCandidate) < 0) {
      await dispatch('closeLocationPopup')
    }

    const circles = selection.selectAll('circle')
      .data(candidates, c => c.key)
    const circleSize = 7
    const circleBorderWidth = 3

    circles
      .attr('r', circleSize / projection.scale)
      .attr('stroke-width', circleBorderWidth / projection.scale)

    circles.enter().append('circle')
      .attr(
        'cx',
        d => projection
          .latLngToLayerPoint([d.lat, d.lng]).x
      )
      .attr(
        'cy',
        d => projection
          .latLngToLayerPoint([d.lat, d.lng]).y
      )
      .attr('r', circleSize / projection.scale)
      .attr('fill', '#66c2a5')
      .attr('stroke', 'white')
      .attr('stroke-width', circleBorderWidth / projection.scale)
      .attr('opacity', 0)
      .style('cursor', 'pointer')
      .on('click', d => {
        dispatch('highlightLocationAcrossViews', d)
        d3.event.stopPropagation()
      })
      .transition()
      .duration(200)
        .attr('opacity', 1)

    circles.exit()
      .transition()
      .duration(200)
        .attr('opacity', 0)
        .remove()
  },

  async highlightCandidate ({ state, commit }, candidate) {
    if (candidate) {
      commit(HIGHLIGHT_CANDIDATE, candidate)
      eventBus.$emit('ResetRankingView', candidate)
    } else {
      commit(HIGHLIGHT_CANDIDATE, null)
    }
  },

  async removeCandidate ({ commit, dispatch }, candidate) {
    commit(REMOVE_CANDIDATE, candidate)
    await dispatch(
      'addCandidateFilter',
      {
        key: 'removed_candidates',
        fn: c => !state.removedCandidateKeys.has(c.key),
        name: 'Manually Removed',
        deleteFn: () => {
          commit(REMOVE_CANDIDATE, null)
          return true
        }
      }
    )
    await dispatch('applyCandidateFilters')
  },

  async createReachabilityAttribute ({ state, commit }, { name, key }) {
    const attr = createAttribute({
      name: 'Duration',
      desc: name,
      key: key,
      normalizer: reversedNormalizer
    })
    commit(ADD_CANDIDATE_ATTRIBUTE, attr)
    commit(INITIALIZE_CANDIDATE_ATTRIBUTE, attr)

    if (state.showFilter) {
      attr.filter = new AttributeFilter(attr)
      attr.filter.initialize(state.candidates)
    }

    return attr
  },

  async updateReachabilityAttribute ({ state, commit }, key) {
    const attr = _.find(state.candidateAttributes, a => a.key === key)
    commit(UPDATE_CANDIDATE_ATTRIBUTE, attr)
  },

  async traceShortestPath ({ dispatch }, { candidates, key, reverse }) {
    const pathKey = `path${key}`
    const routeStyle = {
      color: '#4CAF50',
      weight: 5
    }
    const locationStyle = {
      fill: true,
      fillOpacity: 1,
      color: 'white',
      weight: 2,
      radius: 8
    }
    _.each(candidates, c => {
      let duration = 0
      let current = c[pathKey]

      if (!current.geometry) {
        Vue.set(c, key, undefined)
        return
      }

      let featureCollections = c[`routeCollection${key}`] = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [c.lng, c.lat],
              _[reverse ? 'last' : 'first'](
                current.geometry.coordinates
              )
            ]
          },
          properties: routeStyle
        }]
      }
      while (current && current.geometry) {
        featureCollections.features.push({
          type: 'Feature',
          geometry: current.geometry,
          properties: routeStyle
        })
        featureCollections.features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              _[reverse ? 'first' : 'last'](
                current.geometry.coordinates
              ),
              [current.next.lng, current.next.lat]
            ]
          },
          properties: routeStyle
        })
        featureCollections.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [current.next.lng, current.next.lat]
          },
          properties: {
            ...locationStyle,
            fillColor: current.color,
            clickFn: (function (loc) {
              return d => {
                dispatch('highlightLocationAcrossViews', loc)
              }
            })(current.next)
          }
        })
        duration += current.duration
        current = current.next[pathKey]
      }

      Vue.set(c, key, current ? undefined : duration)
    })
    await dispatch('updateReachabilityAttribute', key)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}

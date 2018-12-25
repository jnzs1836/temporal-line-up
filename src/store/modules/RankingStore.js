import { TOGGLE_RANKING_TEXT } from '../MutationTypes'

export const FilterForcedWidth = 140

const state = {
  showText: true,
  FilterForcedWidth
}

const getters = {
  rankingShowText: state => state.showText,
  rankingFilterForcedWidth: state =>state.FilterForcedWidt,
}

const mutations = {
  [TOGGLE_RANKING_TEXT] (state) {
    state.showText = !state.showText
  }
}

export default {
  state,
  getters,
  mutations
}

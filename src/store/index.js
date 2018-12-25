import Vue from 'vue'
import Vuex from 'vuex'

import CandidateStore from './modules/CandidateStore'
import RankingStore from './modules/RankingStore'
import RegionStore from "./modules/RegionStore";
Vue.use(Vuex)

import _ from 'lodash'

import { MOCK_STORE } from './MutationTypes'

export default new Vuex.Store({
  modules: {
    CandidateStore,
    RankingStore,
    PlanStore,
  },
  state,
  getters,
  mutations,
  actions
})

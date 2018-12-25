<template>
  <div class="lineup-wrapper">

    <column-headers :adding-filter="addingFilter"></column-headers>
    <current-plan v-if="planRetrieved"></current-plan>
    <!--<button> ALPHA </button>-->
    <candidate-list :show-text="showText"></candidate-list>

    <!--<LineChart></LineChart>-->
  </div>
</template>

<script>
import ColumnHeaders from './ColumnHeaders'
import CandidateList from './CandidateList'
import CurrentPlan from './CurrentPlan'
import LineChart from './LineChart';
import {mapGetters} from 'vuex'
export default {
  name: 'lineup',
  props: [
    'showText',
    'addingFilter'
  ],

  components: {
    LineChart,
    CurrentPlan,
    'column-headers': ColumnHeaders,
    'candidate-list': CandidateList,
    'current-plan':CurrentPlan,

  },
  computed:{
    ...mapGetters({
      planRetrieved:'planRetrieved',
    })
  }
}
</script>

<style lang="scss">
@import '../../../styles/Constants.scss';

.lineup-wrapper {
  height: calc(100% - #{$RANKING_FILTER_BAR_HEIGHT});
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>

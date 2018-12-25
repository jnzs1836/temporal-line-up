<template>
  <div class="candidate-list" key="candidates"
    @scroll="mouseDidScrollCandidateList()">
    <transition-group name="candidate-list" tag="div">

      <div class="entry" v-for="c in candidateLazyList"
        :key="c.key"
        :class="{
          highlight: c === highlightedCandidate
        }"
        @click="$store.dispatch('highlightLocationAcrossViews', c)">
        <div class="nameCell">
          <div @click="setShowHistory">
            {{c.name}}
          </div>
        </div>
        <transition-group name="cell" tag="div" class="cell-wrapper">
          <div class="cell" v-for="attr in attributes"
            v-if="!attr.hidden"
            :key="attr.key"
            :style="{
              'flex': `0 0 ${
                px(
                  attr.group
                    ?
                      (
                        showFilter
                          ? attr.group.filteringWidth
                          : attr.group.width
                      )
                    : (showFilter ? FilterForcedWidth : attr.width)
                )
              }`
            }">
            <!--<transition name="fade" >-->
              <!--<div class="text outer"-->
                <!--v-if="!attr.group && showText">-->
                <!--<span v-if="attr.getter(c).value">-->
                  <!--{{attr.getter(c).value}}-->
                <!--</span>-->
              <!--</div>-->
            <!--</transition>-->
            <div class="bar"
              :style="{
                width: px(
                  attr.normalizer(c) *
                    (showFilter ? FilterForcedWidth :(showHistory? lambda *  attr.width/attr.normalizer(c) :attr.width))
                ),
              }">
              <transition name="fade" class="transition-svg">
                <ColorBar v-if="showHistory&&c[attr.key+'History']&&c[attr.key+'History'].length>0" :history="c[attr.key+'History']" :maxValue="attr.maximum" :attrLenght="lambda * attr.width" :candidateLength="attr.normalizer(c)*attr.width"  class="bar-svg"></ColorBar>
                <!--<LineChart :width="attr.normalizer(c) *-->
                    <!--(showFilter ? FilterForcedWidth : attr.width)" :history="c[attr.key+'History']" class="bar-svg"></LineChart>-->
                <!--<svg class="bar-svg">-->
                  <!--<rect width="10%" height="100%" fill="red"/>-->

                  <!--<rect width="4" height="4" style="fill:rgb(0,0,255)"/>-->
                  <!--<polygon :points="points"></polygon>-->

<!--<polygon :points="points"></polygon>-->
                <!--</svg>-->
                <!--<div class="text inner"-->
                  <!--v-if="!attr.group && showText">-->
                  <!--<span v-if="attr.getter(c).value">-->
                    <!--{{attr.getter(c).value}}-->
                  <!--</span>-->

                <!--</div>-->
              </transition>
            </div>

            <div class="group-bar-cont" v-if="attr.group">
              <!-- <div class="animated-spacing"
                v-if="attr.group.attrs.length > 1"
                :style="{
                  width: px((1 - attr.normalizer(c)) * attr.width + 7)
                }">
              </div> -->
              <div class="bar group"
                v-for="gattr in attr.group.children"
                :key="gattr.key"
                :style="{
                  'flex-basis': px(
                    gattr.normalizer(c) *
                      (showFilter ? FilterForcedWidth : gattr.width)
                  )
                }">
                <transition name="fade" class="transition-svg">
                                  <ColorBar v-if="showHistory&&c[attr.key+'History']&&c[attr.key+'History'].length>0" :history="c[attr.key+'History']" :maxValue="attr.maximum" :attrLenght="lambda * attr.width" :candidateLength="attr.normalizer(c)*attr.width"  class="bar-svg"></ColorBar>

                </transition>
                  <!--<circle cx="0" cy="0" r="1" stroke="black" ill="red" />-->
                <!--</svg>-->
              </div>
            </div>
          </div>
          <div class="cell"
            key="abstraction"
            :style="{
              'flex': `0 0 ${
                px(
                  100
                )
              }`
            }">

            <div class="graph-bar"
              :style="{
                width: px(
                  100
                ),
              }">

              <transition name="fade" class="transition-svg">
                <DensityGraph :sequence="c.expansionSequence" class="abstraction"></DensityGraph>
              </transition>
            </div>
          </div>
        </transition-group>
      </div>
    </transition-group>
    <div class="lazy-loader" v-if="!allCandidatesLoaded">
      <i class="fa fa-spin fa-spinner" aria-hidden="true"></i>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import { mapGetters } from 'vuex'
import LineChart from './LineChart';
import { px } from '../../../utils/Formatter'
import { TOGGLE_RANKING_FILTER, SET_ATTRIBUTE_FILTER_RANGE, APPLY_ATTRIBUTE_FILTER, APPLY_CANDIDATE_FILTERS, RESET_ATTRIBUTE_SORTING } from '../../../store/MutationTypes'
import Lineup from "./Lineup";
import DensityGraph from './DensityGraph'
import ColorBar from './ColorBar';
import {lambda} from '../../../utils/AttributeModifier';
const CANDIDATE_PER_PAGE = 20

export default {
  name: 'candidate-list',
  components: { Lineup,LineChart,DensityGraph, ColorBar },
  data: () => ({
    showHistory:false,
    candidateCount: CANDIDATE_PER_PAGE,
    stats:[
  { label: 'A', value: 100 },
  { label: 'B', value: 100 },
  { label: 'C', value: 100 },
  { label: 'D', value: 100 },
  { label: 'E', value: 100 },
  { label: 'F', value: 100 }
],
    showTemporalSequence:false,
    lambda:lambda,
  }),

  mounted: function () {
    this.$bus.$on('ResetRankingView', () => {
      this.resetView()
    });

    this.$bus.$on('jumpToCandidate', c => {
      this.jumpToCandidate(c)
    })
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === TOGGLE_RANKING_FILTER ||
          mutation.type === SET_ATTRIBUTE_FILTER_RANGE ||
          mutation.type === APPLY_ATTRIBUTE_FILTER ||
          mutation.type === APPLY_CANDIDATE_FILTERS) {
        this.resetView()
      }
    })

  },

  methods: {
    px,
    setShowHistory(){
      this.showHistory = !this.showHistory;
    },
    resetView () {
      this.candidateCount = CANDIDATE_PER_PAGE
      $('.candidate-list')[0].scrollTop = 0
    },

    handlerShowTemporal(){
    },
    mouseDidScrollCandidateList: _.throttle(function () {
      if (this.allCandidatesLoaded) {
        return
      }

      const top = $('.lazy-loader').offset().top
      const bottom = $('.candidate-list')[0]
                      .getBoundingClientRect().bottom
      if (top <= bottom) {
        this.candidateCount = Math.min(
          this.candidateList.length,
          this.candidateCount + CANDIDATE_PER_PAGE
        )
      }
    }, 50),

    jumpToCandidate (c) {
      this.$store.commit(RESET_ATTRIBUTE_SORTING)
      _.pull(this.candidateList, c);
      this.candidateList.unshift(c);
      this.resetView();
    }
  },
  watch:{
    // showTemporalSequence:function(value){
    //   console.log("::::::::::::::::");
    // }
  },

  computed: {
    candidateLazyList () {
      let attr = this.attributes[0];
      for(let c of this.candidateList.slice(0, this.candidateCount)){
    }
      return this.candidateList.slice(0, this.candidateCount)
    },
    points: function () {
      var total = this.stats.length;
      return this.stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, total)
        return point.x + ',' + point.y
      }).join(' ')
    },

    allCandidatesLoaded () {
      return this.candidateCount >= this.candidateList.length
    },

    candidateList () {
      return this.showFilter ? this.filteredCandidates : this.candidates
    },
    historyData(){
      return  [3, 9, 9, 9, 9, 2];
    },


    ...mapGetters({
      candidates: 'candidates',
      filteredCandidates: 'filteredCandidates',
      attributes: 'candidateAttributes',
      showText: 'rankingShowText',
      showFilter: 'rankingShowFilter',
      FilterForcedWidth: 'rankingFilterForcedWidth',
      highlightedCandidate: 'highlightedCandidate'
    })
  }
}
function valueToPoint (value, index, total) {
  var x     = 0
  var y     = -value * 0.8
  var angle = Math.PI * 2 / total * index
  var cos   = Math.cos(angle)
  var sin   = Math.sin(angle)
  var tx    = x * cos - y * sin + 100
  var ty    = x * sin + y * cos + 100
  return {
    x: tx,
    y: ty
  }
}

</script>

<style lang="scss">
@import '../../../styles/Constants.scss';

.candidate-list {
  flex: 1;
  height: calc(100% - #{$RANKING_COLUMN_HEADER_HEIGHT} - #{$RANKING_CURRENT_PLAN_HEIGHT});
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  position: relative;
  width: 100%;


  &.cell-transition {
    .cell {
      transition: flex 200ms;
    }
  }

  .entry {
    flex: 0 0 $RANKING_LINEUP_ROW_HEIGHT;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid $GRAY2;
    transition: transform 1s, background-color 400ms;

    &.highlight {
      box-shadow: inset 0 0 6px $RANKING_LINEUP_BAR_COLOR;
    }

    .nameCell {
      flex: 0 0 $RANKING_NAME_CELL_WIDTH;
      line-height: $RANKING_LINEUP_ROW_HEIGHT;
      padding: 0 5px;
      font-size: 14px;
      color: $GRAY5;
      box-sizing: border-box;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 150px;
    }

    .cell-wrapper {
      height:35px;
      display: flex;
      // .fade-leave-active {
      //   position: relative !important;
      // }
    }

    .cell-leave-active {
      display: none;
    }
    .cell-enter-active, .cell-leave-active {
      transition: flex-basis 200ms, width 200ms;
      overflow: hidden;
    }
    .cell-enter, .cell-leave-to {
      flex-basis: 0px;
      width: 0px;
    }

    .cell {
      $cell_x_padding: 5px;
      $cell_y_padding: 5px;
      padding: $cell_x_padding $cell_y_padding;
      border-right: 2px solid transparent;
      position: relative;
      .graph-bar{
        height: 100%;
        float: left;
        position: relative;
        overflow: hidden;
        transition: width 200ms, flex-basis 200ms;
        border-radius: 3px;
        .transition-svg{
          width:100%
        }
        .abstraction{
          width: 100%;
          height:100%

        }
      }
      .bar {
        height: 100%;
        background-color: $RANKING_LINEUP_BAR_COLOR;
        float: left;
        position: relative;
        overflow: hidden;
        transition: width 200ms, flex-basis 200ms;
        border-radius: 3px;
        .transition-svg{
          width:100%
        }
        .abstraction{
          width: 100%;
          height:100%

        }
        .bar-svg{
                margin: 0;
                padding-right: 0;
                padding-left: 0;
                padding-top: 0;
                width: 100%;
                height: 100%;
              }

        &.group {
          flex: 0 0;
          margin-left: 5px;
        }

      }

      .bar-svg{
        width: 100%;
        height: 100%;
      }

      .text {
        position: absolute;
        line-height: $RANKING_LINEUP_ROW_HEIGHT;
        font-size: 13px;
        &.inner {
          color: #fff;
          top: -$cell_y_padding;
          left: 5px;
        }
        &.outer {
          color: $RANKING_LINEUP_BAR_COLOR;
          top: 0;
          left: #{$cell_y_padding + 5px};
        }
      }

      .group-bar-cont {
        height: 100%;
        white-space: nowrap;
        display: flex;
        flex-direction: row;

        @keyframes squeeze {
          to {
            width: 0;
          }
        }

        .animated-spacing {
          float: left;
          height: 100%;
          animation-name: squeeze;
          animation-duration: 500ms;
          animation-fill-mode: forwards;
          transition-duration: 500ms;
        }
      }

      .group-bar-leave-active {
        .animated-spacing {
          animation-direction: reverse;
          animation-play-state: running;
        }
      }

      &:first-child {
        border-left: 1px solid $GRAY2;
      }
    }

    &:nth-child(even) {
      background-color: $GRAY1;
    }
  }

  .lazy-loader {
    flex: 0 0 70px;
    overflow: hidden;

    i {
      line-height: 70px;
      text-align: center;
      width: 100%;
      font-size: 24px;
    }
  }
}
circle{
  color: red;

  z-index: 0;
}
.candidate-list-move, .candidate-list-enter-active,.candidate-list-leave-active {
  box-shadow: 0 -1px 0 $GRAY2;
}

.candidate-list-leave-active {
  position: absolute;
}

.candidate-list-enter, .candidate-list-leave-to {
  transform: translateY(800px);
}
  polygon {
    fill: #42b983;
    opacity: .75;
}
</style>

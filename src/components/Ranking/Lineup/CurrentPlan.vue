<template>
  <div v-if="planRetrieved">

    <transition name="current-plan-wrapper" tag="div">
      <div class="current-plan-line">

      <transition-group name="cell-wrapper" tag="div" class="cell-wrapper">
        <div class="nameCell" key="name">
          <div @click="setShowHistory">
            {{"Current Plan"}}
          </div>
        </div>
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

            <div class="bar"
              :style="{
                width: px(
                  attr.normalizer(planMetrics) *
                    (showFilter ? FilterForcedWidth :(showHistory? lambda *  attr.width/attr.normalizer(planMetrics) :attr.width))
                ),
              }">
              <transition name="fade" class="transition-svg">
                <ColorBar v-if="showHistory&&planMetrics[attr.key+'History']&&planMetrics[attr.key+'History'].length>0" :history="planMetrics[attr.key+'History']" :maxValue="attr.maximum" :attrLenght="lambda * attr.width" :candidateLength="attr.normalizer(limitPlan)*attr.width" class="bar-svg"></ColorBar>
              </transition>
            </div>

            <div class="group-bar-cont" v-if="attr.group">

              <div class="bar group"
                v-for="gattr in attr.group.children"
                :key="gattr.key"
                :style="{
                  'flex-basis': px(
                    gattr.normalizer(planMetrics) *
                      (showFilter ? FilterForcedWidth : gattr.width)
                  )
                }">
                <transition name="fade" class="transition-svg">
                                <ColorBar v-if="showHistory&&planMetrics[attr.key+'History']&&planMetrics[attr.key+'History'].length>0" :history="planMetrics[attr.key+'History']" :maxValue="attr.maximum" :attrLenght="lambda * attr.width" :candidateLength="attr.normalizer(limitPlan)*attr.width" class="bar-svg"></ColorBar>
                </transition>

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

            <!--<div class="graph-bar"-->
              <!--:style="{-->
                <!--width: px(-->
                  <!--100-->
                <!--),-->
              <!--}">-->

              <!--<transition name="fade" class="transition-svg">-->
                <!--<DensityGraph :sequence="c.expansionSequence" class="abstraction"></DensityGraph>-->
              <!--</transition>-->
            <!--</div>-->
          </div>
        </transition-group>
        </div>

    </transition>
      <!--<h3>dssssssssssssssss</h3>-->
      <!--<div class="entry">-->
        <!--:key="KKKKK"-->

        <!--@click="$store.dispatch('highlightLocationAcrossViews', c)">-->
        <!--<div class="name" >{{"Current Plan"}}</div>-->
        <!--<transition-group ,k,key="nameKey" name="cell" tag="div" class="cell-wrapper">-->
          <!--<div class="cell" v-for="attr in attributes"-->
            <!--v-if="!attr.hidden"-->
            <!--:key="attr.key"-->
            <!--:style="{-->
              <!--'flex': `0 0 ${-->
                <!--px(-->
                  <!--attr.width-->
                <!--)-->
              <!--}`-->
            <!--}">-->
            <!--<transition name="fade">-->
              <!--<div class="text outer"-->
                <!--v-if="!attr.group">-->
                <!--<span v-if="attr.getter(planMetrics).value">-->
                  <!--{{attr.getter(planMetrics).value}}-->
                <!--</span>-->
              <!--</div>-->
            <!--</transition>-->
            <!--<div class="bar"-->
              <!--:style="{-->
                <!--width: px(-->
                  <!--attr.normalizer(planMetrics) *-->
                     <!--attr.width-->
                <!--)-->
              <!--}">-->
              <!--<transition name="fade">-->
                <!--<div class="text inner"-->
                  <!--v-if="!attr.group">-->
                  <!--<span v-if="attr.getter(planMetrics).value">-->
                    <!--{{attr.getter(planMetrics).value}}-->
                  <!--</span>-->

                <!--</div>-->
              <!--</transition>-->
            <!--</div>-->

          <!--</div>-->
        <!--</transition-group>-->
      <!--</div>-->
    <!--</transition-group>-->
  </div>
</template>

<script>
  import _ from 'lodash'
import $ from 'jquery'
import { mapGetters } from 'vuex'
import {lambda} from '../../../utils/AttributeModifier';
import { px } from '../../../utils/Formatter'
import { TOGGLE_RANKING_FILTER, SET_ATTRIBUTE_FILTER_RANGE, APPLY_ATTRIBUTE_FILTER, APPLY_CANDIDATE_FILTERS, RESET_ATTRIBUTE_SORTING } from '../../../store/MutationTypes'
import ColorBar from './ColorBar'

    export default {
        name: "CurrentPlan",
      mounted:function(){
          console.log("DDDDDDDDD");
        console.log(this.attributes);
      },
      components:{
          ColorBar,
      },
      computed:{
          planMetrics:function () {
              let out = this.getPlanMetrics;
                _.each(this.candidateAttributes, attr => attr.updater(out));
              return out;
              console.log(out);
          },
        ...mapGetters({
          getPlanMetrics:'getPlanMetrics',
          attributes: 'candidateAttributes',
          candidateAttributes:'candidateAttributes',
          planRetrieved:'planRetrieved',
          showFilter: 'rankingShowFilter',
          limitPlan:'getLimitPlan',

        })
      },
      methods:{
          px,
        setShowHistory(){
            this.showHistory = !this.showHistory;
            },
      },
      data(){
          return {
            nameKey:"name",
            t:"t",
            showHistory:false,
                        lambda:lambda,

          }
      }
    }
</script>

<style lang="scss">
@import '../../../styles/Constants.scss';

.current-plan-wrapper {
  flex: 1;
  height: calc(#{$RANKING_CURRENT_PLAN_HEIGHT});
  display: flex;
  overflow-y: scroll;
  position: relative;
  width: 100%;


  &.cell-transition {
    .cell {
      transition: flex 200ms;
    }
  }

  .current-plan-line {
    flex: 0 0 1;
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
      background-color: #3f51b5;
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
  .cell-wrapper {
      height:35px;
      display: flex;

      // .fade-leave-active {
      //   position: relative !important;
      // }
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
</style>

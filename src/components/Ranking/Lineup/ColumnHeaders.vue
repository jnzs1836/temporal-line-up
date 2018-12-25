<template>
  <div class="column-headers"
    :class="{
      filtering: showFilter
    }"
    :style="{
      'flex-basis': px(showFilter ? 150 : 50)
    }"
    @mousemove="mouseDidMoveOnColumnHeaders($event)"
    @mouseup="mouseDidReleaseOnColumnHeaders($event)">
    <div class="header" v-for="attr in attributes"
      :key="attr.name"
      :class="{
        grouped: showFilter ? false : attr.group,
        'no-transition': resizing,
        resizing: resizing && resizingTarget === attr
      }"
      :style="{
        'flex-basis': px(showFilter ? FilterForcedWidth : attr.width),
        width: px(showFilter ? FilterForcedWidth : attr.width)
      }"
      @click="mouseDidClickOnAttribute($event, attr)"
      @contextmenu="mouseDidRightClickOnAttribute($event, attr)">
      <div class="name">{{attr.name}}</div>
      <div class="desc">
        {{attr.group
          ? prec2(attr.width / attr.group._width)
          : attr.desc}}
      </div>
      <transition name="fade">
        <i v-if="attr.group"
          class="grouping fa fa-thumb-tack"></i>
      </transition>
      <transition name="fade">
        <i v-if="attr.sorted"
          class="sorting fa fa-sort-numeric-desc"></i>
      </transition>
      <transition name="fade">
        <i class="delete-btn fa fa-trash" v-if="!showFilter"
          @click="mouseDidClickDeletingColumn($event, attr)"></i>
      </transition>
      <transition name="fade">
        <i class="reset-btn fa fa-undo"
          v-if="showFilter && !attr.filter.pristine"
          @click="mouseDidClickUndoFilter(attr)"></i>
      </transition>
      <transition name="fade">
        <i class="accept-btn fa fa-check"
          v-if="showFilter && !attr.filter.pristine"
          @click="mouseDidClickCommittingFilter(attr)"></i>
      </transition>
      <div class="resizer"
        @mousedown="mouseDidPressOnResizer($event, attr)"></div>
      <div class="filter" v-if="showFilter">
        <div class="bar-wrapper">
          <div class="bar-cont">
            <div class="bar" v-for="(opt, i) in attr.filter.options"
              :style="{
                left: prec(opt.styles.left),
                width: prec(opt.styles.width),
                height: prec(opt.styles.height)
              }"
              @click="mouseDidClickFilterOption(attr, i)">
              <div class="shadow"
                :style="{
                  height: prec(opt.styles.shadow)
                }"></div>
            </div>
            <div class="range left"
              :class="{
                active: ranger && ranger.target == attr && ranger.type == 'left',
              }"
              :style="{
                left: prec(attr.filter.range[0])
              }"
              @mousedown="mouseDidPressOnRanger($event, attr, 'left')"></div>
            <div class="range right"
              :class="{
                active: ranger && ranger.target == attr && ranger.type == 'right'
              }"
              :style="{
                left: prec(attr.filter.range[1])
              }"
              @mousedown="mouseDidPressOnRanger($event, attr, 'right')"></div>
            <div class="range-axis left"
              :style="{
                width: prec(attr.filter.range[0])
              }"></div>
            <div class="range-axis right"
              :style="{
                width: prec(1 - attr.filter.range[1])
              }"></div>
          </div>
        </div>
        <div class="label">
          <div class="text minimum">
            {{
              csn(
                attr.filter.valueRange[0]
              )
            }}
          </div>
          <div class="text maximum">
            {{
              csn(
                attr.filter.valueRange[1]
              )
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import { mapGetters } from 'vuex'

import { px, prec, prec2, csn } from '../../../utils/Formatter'
import { SORT_CANDIDATES, RESIZE_ATTRIBUTE, SELECT_ATTRIBUTE_FILTER_OPTION } from '../../../store/MutationTypes'

export default {
  name: 'column-headers',

  data: () => ({
    resizing: null,
    resizingTarget: null,
    justResized: false,

    ranger: null
  }),

  methods: {
    px,
    prec,
    prec2,
    csn,

    resetView () {
      this.$bus.$emit('ResetRankingView')
    },

    sortLazy: _.throttle(function () {
      this.$store.commit(SORT_CANDIDATES)
    }, 200),

    mouseDidClickOnAttribute (e, attr) {
      if (this.showFilter) {
        return
      }

      if (this.justResized) {
        this.justResized = false
        return
      }
      if (e.button === 0) {
        this.$store.commit(SORT_CANDIDATES, attr)
        this.resetView()
      }
    },

    mouseDidRightClickOnAttribute (e, attr) {
      if (this.showFilter) {
        return
      }

      e.preventDefault()
      this.$store.dispatch('toggleAttributeGrouping', attr)
      this.resetView()
    },

    mouseDidPressOnResizer (e, attr) {
      if (this.showFilter) {
        return
      }

      this.resizing = e.pageX
      this.resizingTarget = attr
      this.resetView()
      e.stopPropagation()
    },

    mouseDidPressOnRanger (e, attr, type) {
      // if (attr.type !== 'CONTINUOUS') {
      //   return
      // }
      this.ranger = {
        type,
        cursorX: e.pageX,
        target: attr,
        width: $('.filter .bar-cont').width()
      }
    },

    mouseDidMoveOnColumnHeaders (e) {
      if (this.resizing) {
        const delta = e.pageX - this.resizing
        this.$store.commit(RESIZE_ATTRIBUTE, {
          attr: this.resizingTarget,
          delta
        })
        this.resizing = e.pageX
        this.justResized = true

        if (this.resizingTarget.group && this.sortingAttribute &&
            this.resizingTarget.group === this.sortingAttribute.group) {
          this.sortLazy()
        }
      }
      if (this.ranger) {
        const delta = (e.pageX - this.ranger.cursorX) / this.ranger.width
        this.$store.dispatch(
          'moveAttributeFilterRange',
          {
            left: this.ranger.type === 'left',
            attr: this.ranger.target,
            delta
          }
        )
        this.ranger.cursorX = e.pageX
      }
    },

    mouseDidReleaseOnColumnHeaders (e) {
      if (this.resizing) {
        this.resizing = null
        setTimeout(() => {
          this.justResized = false
        }, 50)
      }

      if (this.ranger) {
        this.$store.dispatch(
          'applyAttributeFilter',
          this.ranger.target
        )
        this.ranger = null
      }
    },

    mouseDidClickDeletingColumn (e, attr) {
      e.stopPropagation()
      this.$store.dispatch('removeAttribute', attr)
    },

    mouseDidClickUndoFilter (attr) {
      this.$store.dispatch('resetAttributeFilter', attr)
    },

    mouseDidClickCommittingFilter (attr) {
      this.$store.dispatch('commitAttributeFilter', attr)
    },

    mouseDidClickFilterOption (attr, id) {
      this.$store.commit(SELECT_ATTRIBUTE_FILTER_OPTION, {
        attr,
        id
      })
      this.$store.dispatch('applyAttributeFilter', attr)
      // this.$store.commit(APPLY_ATTRIBUTE_FILTER, attr)
    }
  },

  computed: {
    ...mapGetters({
      attributes: 'candidateAttributes',
      sortingAttribute: 'sortingAttribute',
      showFilter: 'rankingShowFilter',
      FilterForcedWidth: 'rankingFilterForcedWidth'
    })
  }
}
</script>

<style lang="scss">
@import '../../../styles/Constants.scss';

.column-headers {
  flex: 0 0;
  overflow: hidden;
  padding-left: $RANKING_NAME_CELL_WIDTH;
  height: $RANKING_COLUMN_HEADER_HEIGHT;
  display: flex;
  flex-direction: row;
  background-color: $GRAY1;
  border-bottom: 1px solid $GRAY2;
  position: relative;
  transition: flex-basis 200ms;

  .header {
    flex: 0 0;
    background-color: $GRAY1;
    // border-right: 2px solid $GRAY0;
    padding: 7px 7px 6px 5px;
    position: relative;
    transition: background-color 200ms, width 200ms, flex-basis 200ms;
    overflow: hidden;

    &.no-transition {
      transition: flex-basis 0s, width 0s;
    }
    &.resizing {
      background-color: $GRAY2;
    }
    &.grouped {
      background-color: $GRAY1D;
    }

    &:first-child {
      border-left: 1px solid $GRAY2;
    }

    & > div {
      cursor: default;
    }

    .name {
      font-size: 15px;
      color: $GRAY5;
      text-shadow: 0 0 2px $GRAY3;
      margin-right: 25px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .desc {
      padding-top: 2px;
      font-size: 13px;
      color: $GRAY4;
      margin-right: 50px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .delete-btn, .sorting, .grouping, .accept-btn, .reset-btn {
      position: absolute;
      padding: 3px;
      font-size: 15px;
      right: 5px;
      color: $GRAY4;
      width: 20px;
      text-align: center;
      color: $GRAY4;
    }

    .sorting {
      top: 5px;
      font-size: 14px;
    }

    .grouping {
      top: 5px;
      right: 23px;
      font-size: 14px;
    }

    .delete-btn {
      bottom: 5px;
      cursor: pointer;
      transition: color 200ms;
      color: $GRAY4;

      &:hover {
        color: $RANKING_COLUMN_DELETE_BUTTON_COLOR;
      }
    }

    .accept-btn {
      top: 25px;
      cursor: pointer;
      transition: color 200ms;
      color: #43A047;

      &:hover {
        color: #66BB6A;
      }
    }

    .reset-btn {
      font-size: 14px;
      top: 25px;
      right: 25px;
      cursor: pointer;
      transition: color 200ms;
      color: $GRAY4;

      &:hover {
        color: $RANKING_COLUMN_DELETE_BUTTON_COLOR;
      }
    }

    .resizer {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      width: 1px;
      border-left: 5px solid transparent;
      border-right: 1px solid $GRAY2;
      background-clip: padding-box;
      cursor: ew-resize;
    }

    .filter {
      position: absolute;
      height: 100px;
      left: 0px;
      right: 0px;
      top: 50px;

      .bar-wrapper {
        height: 70px;
        margin: 0 10px 10px 10px;
        border-bottom: 3px solid #FFB300;
        position: relative;
        padding: 1px 10px;
        box-sizing: border-box;

        .bar-cont {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .bar {
          position: absolute;
          width: 25%;
          bottom: 0;
          background-color: $GRAY2;
          overflow: hidden;
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          transition: background-color 200ms, height 200ms;

          .shadow {
            position: absolute;
            left: 0;
            width: 100%;
            bottom: 0;
            background-color: #FFB300;
            transition: background-color 200ms, height 200ms;

            &:hover {
              background-color: lighten(#FFB300, 10%);
            }
          }
        }

        @for $i from 1 through 5 {
          .bar:nth-child(#{$i}) {
            left: percentage(0 + ($i - 1) * 0.2);
            width: 18.5%;
          }
        }

        .range {
          position: absolute;
          // box-sizing: content-box;
          top: calc(100% + 4px);
          transform: translate(-50%, 0);
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 8px solid #FF7043;
          transition: border-bottom 200ms, left 200ms;
          cursor: pointer;

          &:hover, &.active {
            border-bottom: 8px solid lighten(#FF7043, 10%);
          }
        }
      }

      .range-axis {
        position: absolute;
        height: 3px;
        transform: translateY(1px);
        top: 100%;
        background-color: #FF7043;
        border-left: 10px solid #FF7043;
        transition: width 200ms;
        // border-bottom: 2px solid #607D8B;

        width: 10px;

        &.left {
          left: -10px;
        }

        &.right {
          right: -10px;
        }
      }

      .label {
        display: flex;
        padding: 0 10px;

        .text {
          flex: 1;
          font-size: 12px;
          color: $GRAY5;
          text-shadow: 0 0 1px $GRAY3;
          &.maximum {
            text-align: right;
          }
        }
      }
    }

    &:hover {
      background-color: $GRAY2;
    }
  }

  &.filtering {
    .header:hover {
      background-color: $GRAY1;
    }
  }
}
</style>

<template>
  <div id="ranking">
    <lineup></lineup>

    <div class="filter-cont">
      <div class="filters">
        <span>FILTERS:</span>
        <span class="filter-btn" v-for="(f, key) in filters">
          <div v-html="f.name"></div>
          <i class="remove fa fa-close"
            @click="mouseDidClickRemovingFilter(key)"></i>
        </span>
        <span id="showFilterButton">
        <b-button right class="add-btn"
          :class="{ active: showFilter }"
          @click="toggleFilter()">Show Filter</b-button>
        </span>
      </div>
      <i class="left-btn column-btn fa fa-columns" aria-hidden="true"
        :class="{
          disabled: !removedAttributes.length,
          active: showColumnRestoreMenu
        }"
        @click="showColumnRestoreMenu = !showColumnRestoreMenu">
        <div class="menu" v-if="showColumnRestoreMenu">
          <ul>
            <li v-for="attr in removedAttributes"
              :key="attr.key"
              @click="mouseDidClickRestoringColumn($event, attr)">
              {{ attr.name }}
            </li>
          </ul>
        </div>
      </i>
      <i class="left-btn text-btn fa fa-commenting-o" aria-hidden="true"
        :class="{ active: showText }"
        @click="toggleText()"></i>
      <!--<span class="candidate-count">{{candidateCount}}</span>-->
    </div>
  </div>
</template>

<script>
// import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);
import { mapGetters } from 'vuex'

import { TOGGLE_RANKING_TEXT, TOGGLE_RANKING_FILTER } from '../../store/MutationTypes'

import Lineup from './Lineup/Lineup'

export default {
  name: 'Ranking',

  data: () => ({
    showColumnRestoreMenu: false
  }),

  methods: {
    mouseDidClickRestoringColumn (e, attr) {
      this.$store.dispatch('restoreAttribute', attr)
    },

    toggleText () {
      this.$store.commit(TOGGLE_RANKING_TEXT)
    },

    toggleFilter () {
      this.$store.commit(TOGGLE_RANKING_FILTER)
    },

    mouseDidClickRemovingFilter (key) {
      this.$store.dispatch('deleteCandidateFilter', key)
      // this.$store.commit(DELETE_CANDIDATE_FILTER, key)
      // this.$store.commit(APPLY_ATTRIBUTE_FILTER)
    }
  },

  computed: {
    candidateCount () {
      return this.showFilter
        ? this.filteredCandidates.length
        : this.candidates.length
    },

    ...mapGetters({
      removedAttributes: 'removedAttributes',
      showText: 'rankingShowText',
      showFilter: 'rankingShowFilter',
      filters: 'rankingFilters',
      candidates: 'candidates',
      filteredCandidates: 'filteredCandidates',
    })
  },

  components: {
    'lineup': Lineup
  }
}
</script>

<style lang="scss">
@import '../../styles/Constants.scss';

#ranking {
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
  border-bottom: none;
  position: relative;

  .filter-cont {
    height: $RANKING_FILTER_BAR_HEIGHT;
    background-color: $GRAY1;
    border-top: 1px solid $GRAY2;
    position: relative;

    .filters {
      position: relative;
      margin-left: $RANKING_NAME_CELL_WIDTH;
      border-left: 1px solid $GRAY2;
      padding: 0 10px;
      font-size: 14px;
      color: #777;

      span {
        margin-right: 5px;
        line-height: $RANKING_FILTER_BAR_HEIGHT - 2px;
        transform: translateY(-1px);
      }

      .filter-btn {
        position: relative;
        display: inline-block;
        background-color: white;
        height: 23px;
        line-height: 22px;
        padding: 0 25px 0 10px;
        border: 1px solid $GRAY2;

        .remove {
          position: absolute;
          top: 4px;
          right: 6px;
          width: 15px;
          height: 15px;
          line-height: 15px;
          text-align: center;
          cursor: pointer;

          transition: color 200ms;
          color: $GRAY4;

          &:hover {
            color: $RANKING_COLUMN_DELETE_BUTTON_ACTIVE_COLOR;
          }
        }
      }

      .add-btn {
        position: absolute;
        top: 7px;
        right: 7px;
        display: block;
        height: 24px;
        line-height: 24px;
        padding: 0 10px;
        background-color: $GRAY0;
        border: 1px solid $GRAY3;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 200ms, color 200ms;

        &:hover {
          background-color: $GRAY1;
        }

        &.active {
          background-color: $GRAY4;
          color: white;
        }
      }
    }

    .left-btn {
      display: block;
      position: absolute;
      top: #{($RANKING_FILTER_BAR_HEIGHT - 24) / 2 - 1};
      width: 22px;
      height: 22px;
      line-height: 22px;
      border: 1px solid $GRAY4;
      border-radius: 3px;
      text-align: center;
      font-size: 13px;
      background-color: $GRAY0;
      transition: background-color 200ms, color 200ms;
      cursor: pointer;

      &:hover {
        background-color: $GRAY1;
      }

      &.active {
        background-color: $GRAY4;
        color: white;
      }
    }

    .column-btn {
      // top: #{($RANKING_FILTER_BAR_HEIGHT - 24) / 2 + 1};
      left: 7px;

      %triangle {
        content: '';
        position: absolute;
        left: 17px;
        bottom: -10px;
        border-right: 8px solid transparent;
        border-left: 8px solid transparent;
        border-top: 10px solid #ddd;
        transform: translateX(-4px);
      }

      .menu{
        font-family: 'Lato', Arial, Helvetica, sans-serif;
        text-shadow: none;
        position: absolute;
        left: -10px;
        bottom: calc(100% + 14px);
        width: 120px;

        &::before {
          @extend %triangle;
        }

        &::after {
          @extend %triangle;
          border-top: 9px solid #fff;
          transform: translate(-4px, -2px)
        }

        ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 5px;

          li {
            color: $GRAY5;
            text-align: left;
            padding: 0 10px;
            height: 28px;
            line-height: 28px;
            border-bottom: 1px solid #eee;
            cursor: pointer;

            &:last-child {
              border-bottom: none;
            }

            &.active {
              background-color: #f7f7f7;
            }
            &:hover {
              background-color: #eee;
            }
          }
        }
      }

      &.disabled {
        .menu {
          display: none;
        }
        color: $GRAY3;
        cursor: not-allowed;
        &:hover {
          background-color: white;
        }
      }
    }

    .text-btn {
      left: 35px;
    }

    .candidate-count {
      display: block;
      position: absolute;
      top: 0;
      left: 65px;
      width: 75px;
      line-height: 35px;
      color: #666;
      text-align: right;
    }
    #showFilterButton{
      text-align: right;
    }
  }
}
</style>

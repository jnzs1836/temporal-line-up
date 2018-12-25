// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import 'leaflet.icon.glyph';
import "leaflet/dist/leaflet.css";
import BootstrapVue from 'bootstrap-vue'
import Trend from 'vuetrend';
Vue.use(Trend);
import VueModalTor from 'vue-modaltor'
Vue.use(VueModalTor);
import heatmap from 'vue-heatmapjs'

import Vuex from 'vuex'
Vue.use(BootstrapVue);
Vue.use(heatmap)

Vue.config.productionTip = false
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import store from './store'
delete L.Icon.Default.prototype._getIconUrl;
import eventBus from './utils/EventBus'


Vue.mixin({
  created () {
    this.$bus = eventBus

    this.$startDragging = (moveCb, releaseCb) => {
      const cancelFn = e => {
        document.removeEventListener('mousemove', moveCb)
        document.removeEventListener('mouseup', cancelFn)
        releaseCb(e)
      }
      document.addEventListener('mousemove', moveCb)
      document.addEventListener('mouseup', cancelFn)
    }
  }
})

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})

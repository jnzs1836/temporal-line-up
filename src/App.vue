<template>
<div id="app">
    <Ranking id="line_up"></Ranking>

</div>

</template>

<script>
  import Vue from 'vue'
import Vuex from 'vuex'
  Vue.use(Vuex);
  import BootstrapVue from 'bootstrap-vue'
  Vue.use(BootstrapVue);
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap-vue/dist/bootstrap-vue.css'
import Ranking from './components/Ranking/Ranking';


export default {
  name: 'App',

  components: {
    Ranking,
  },
  created: async function () {
    const [ , , candidates ] = await Promise.all([
      this.$store.dispatch('fetchLocationSources'),
      this.$store.dispatch('initializeHeatmapGrids'),
      this.$store.dispatch('fetchCandidates')
    ]);
  },
  data () {
    return {
      currentView: 'simple-map',

    };
  },

  watch:{

  }
};
</script>

<style>


.leaflet-fake-icon-image-2x {
  background-image: url(../node_modules/leaflet/dist/images/marker-icon-2x.png);
}
.leaflet-fake-icon-shadow {
  background-image: url(../node_modules/leaflet/dist/images/marker-shadow.png);
}
@import "../node_modules/leaflet/dist/leaflet.css";
body {
  /*margin: 0px;*/
  font-family: "Arial Black", Verdana, sans-serif;
  background-color: #ecf0f1;
}
#main_view {
  display: flex;
  flex:0 0 60%;
  flex-direction: row;
  height: 70%;
  /*flex-wrap: nowrap;*/
}
#side {
  flex: 1 1 25%;
  margin-left: 1%;
  margin-right: 1%;
  /*width:300px;*/
}
#full_div {
  flex: 1 1 75%;
  margin-right: 1%;
  width: 0;
  margin-top: 30px;
}
#bottom_panel{
  flex:1 1 100%;
  display: flex;
  flex-direction: row;
}
#line_up{
  flex: 1 1 75%;
  margin-right: 1%;
  width: 0;
}
#lens{
  flex: 1 1 75%;
  margin-right: 1%;
  width: 0;
}
#vertical_line_up{
  flex: 1 1 50%;
  margin-right: 1%;
  width: 0;
}

#box{
  flex: 1 1 25%;
  margin-left: 1%;
}
#app{
  font-family: 'Lato', '等线', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
}


ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
li {
  font: 200 15px/1.5 Helvetica, Verdana, sans-serif;
  border-bottom: 1px solid #ccc;
}
li:last-child {
  border: none;
}
li a {
  font-size: 15px;
  padding-left: 8px;
  text-decoration: none;
  color: #000;
  display: block;
  -webkit-transition: font-size 0.3s ease, background-color 0.3s ease;
  -moz-transition: font-size 0.3s ease, background-color 0.3s ease;
  -o-transition: font-size 0.3s ease, background-color 0.3s ease;
  -ms-transition: font-size 0.3s ease, background-color 0.3s ease;
  transition: font-size 0.3s ease, background-color 0.3s ease;
}
li a:hover {
  font-size: 20px;
  background: #f6f6f6;
}
  .box{
    background-color: cyan;
    width: 200px;
    height: 100px;
  }
  #bottom-card{
    margin: 1%;
  }
</style>

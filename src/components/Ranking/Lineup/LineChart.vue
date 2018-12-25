<template>
    <div class="container">
      <svg class="svg-container" ref="svg_container">
        <g id="line" transform="translate(0,0)">
        <!--<rect width="100px" height="100%" fill="red" opacity="0" x="0" />-->
        <!--<circle cy="20px" r="20px"></circle>-->
          <path class="area" v-bind:d="pathData" ></path>
          </g>
      </svg>
    </div>
</template>


<script>
import * as d3 from 'd3';
export default {
  name: 'line-chart',
  mounted() {
  },
  props:['width','history'],
  computed:{
    pathData() {

          // let width = d3.select('.container').node().getBoundingClientRect().width;
    let data = this.history;
      const x = d3.scaleLinear().range([0,this.width]);
    const y = d3.scaleLinear().range([20, 0]);
    d3.axisLeft().scale(x);
    d3.axisTop().scale(y);
    x.domain(d3.extent(data, (d, i) => i));
    y.domain([0, d3.max(data, d => d)]);
    const createPath = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d));
    let areaProcess = d3.area().x((d,i) => x(i)).y0(d => 20).y1(d => y(d))
      console.log(data);
    return areaProcess(data)
    }
  },
  methods:{
    createArea: d3.area().x((d,i) => i).y0(d => 20).y1(d => d),
  },
  data:()=>{
    return {
      // width:50,
    }
  }
};
</script>


<style scoped>
  .container{
    width:100%;
  height: 100%;
  }
.svg-container{
  width:100%;
  height: 100%;

}
  #line{
    width: 100%;
    height: 100%;
  }
</style>

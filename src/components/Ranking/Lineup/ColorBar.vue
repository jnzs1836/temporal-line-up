<template>
  <div id="container" >
    <div class="bar" :style="{background: gradient}" ref="bar">
      <svg ref="svg">
        <!--<circle r="10" cx="4" cy="3" fill="red" :opacity="0"></circle>-->
        <rect height="8" :width="candidateLength" x="0" :y="height - 5" fill="E08E00"></rect>
        <rect :height="height" width="4" :x="candidateLength" :y="0" fill="rbg(170, 152, 57)"></rect>
      </svg>
    </div>
    <!--<div id="svg-container">-->
      <!--<svg>-->
        <!--<defs>-->
          <!--<linearGradient id="mainGradient">-->
            <!--<stop class="stop-left" offset="0"></stop>-->
            <!--<stop class="stop-right" offset="1"></stop>-->
          <!--</linearGradient>-->
        <!--</defs>-->
        <!--<rect height="10" width="10" class="filled"></rect>-->
        <!--<rect height="10" width="10" class="outlined"></rect>-->
      <!--</svg>-->
      <!--</div>-->
    <!--<svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">-->
      <!--<linearGradient id="my-cool-gradient" x2="1" y2="1">-->
        <!--<stop offset="0%" stop-color="#000000" />-->
        <!--<stop offset="50%" stop-color="#224488" />-->
        <!--<stop offset="100%" stop-color="#112266" />-->
      <!--</linearGradient>-->

    <!--</svg>-->
    <!--<svg>-->
            <!--<circle r="14" cx="3" cy="8" fill="url(#my-cool-gradient) #447799"></circle>-->
    <!--</svg>-->
    <!--<svg class="icon" fill="url(#my-cool-gradient) #447799;" aria-hidden="true" focusable="false">-->
      <!--<use xlink:href="#symbol-id"></use>-->
    <!--</svg>-->


    <!--<svg>-->
      <!--<defs>-->
        <!--<linearGradient id="linear-gradient" x1="0%" y1="0%" x2="80%" y2="0%">-->

        <!--</linearGradient>-->
      <!--</defs>-->
      <!--<rect :style="styleObject" height="20" width="10" ></rect>-->

    <!--</svg>-->
  </div>
</template>

<script>
    import * as d3 from 'd3';
    import { mapGetters } from 'vuex'

    export default {
        name: "ColorBar",
      mounted(){
          this.height = this.$refs.bar.clientHeight;
        this.colorScale = (value)=>{
          return d3.interpolateBlues(value/this.maxValue);
        };
        this.colors = [];
        this.start = this.colorScale(0);
        this.end = this.colorScale(1);
        let length = this.history.length;
        for(let i = 0 ; i < length; i+=length/10){
          this.colors.push(this.colorScale(this.history[Math.floor(i)]));
        }
        // this.colorScale = (value)=>{
        //   return "#660000";
        // }
        // let linea/rGradient= d3.select("LinearGradient");
        // linearGradient.append("stop")
        //     .attr("offset", "0%")
        //     .attr("stop-color", "#ffa474"); //light blue
//
// Set the color for the end (100%)
              // linearGradient.append("stop")
              // .attr("offset", "100%")
              //   .attr("stop-color", "#8b0000"); //dark blue
        // let svg = d3.select("svg");
        // console.log(svg);
        // this.styleObject.fill = "url(#linear-gradient)";
        // let rects = svg.selectAll("rect").data([43])
        // rects.enter().append("rect");
        //   rects.style("fill", "#009900");


      },
      props:['history','maxValue','attrLength','candidateLength'],
      data(){
          return {
            colorScale:(value)=>{
              return "#880000";
            },
            styleObject:{
              fill:"#993300",
            },
            	start: '#f0f',
              end: '#0f0',
            colors:[],
            height:0,
          }
      },
      methods:{
          drawByD3(){
          }
      },
      computed: {
        ...mapGetters({
          roadLimit:'roadLimit',
        }),
          gradient () {
            // return "#990000"
            return `linear-gradient(to right, ${this.colors.map((color,index)=>`${color}`)})`
          },
  },
    }
</script>

<style scoped>

  .bar{
    width: 100%;
    height: 100%;
  }
  .stop-left {
                stop-color: #3f51b5;  /* Indigo */
            }



  .stop-right {
    stop-color: #009688;  /* Teal */
  }

  .filled {
    fill: url(#mainGradient);
  }
  .outlined {
    fill:   none;
    stroke: url(#mainGradient);
    stroke-width: 4;
  }
  #container{
    background: linear-gradient(to top right, #f6f5f0, #fefefd);
  }
  .color-rect{
    fill:darkslateblue;
  }

</style>

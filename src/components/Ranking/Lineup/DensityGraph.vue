<template>
   <div class="heatmap" ref="heatmap">

     <svg>

<g v-for="(line,lineIndex) in lines">
        <rect v-for="(value,longitudeIndex) in line" :x="xScale(longitudeIndex.toString())" :y="yScale(lineIndex)" :width="itemWidth" :height="itemHeight" :fill="colorScale(value)"></rect>
        <!--<rect v-for="(longitude,longitudeIndex) in line" x="46" y="4" width="4" height="10" fill="blue"></rect>-->

        <!--<nobr v-for="(longitude,longitudeIndex) in line">{{xScale(longitudeIndex.toString())}}</nobr>-->
        <!--<rect v-for="(longitude,longitudeIndex) in line" x="this.xScale(longitudeIndex.toString()).toString()" y="yScale(lineIndex.toString())" width="10" height="10" fill="blue"></rect>-->
       </g>
</svg>
   </div>
</template>

<script>
  import * as d3 from 'd3';
  import { mapGetters } from 'vuex'

    export default {

    name: "DensityGraph",
      props:['sequence'],
      mounted(){
          let valueMax = 0;
        this.lines= [];
          for(let i = 0; i < this.latitudeSeparationNum; i++){
            let tmp = [];
            for(let j = 0; j < this.longitudeSeparationNum; j++){
              tmp.push(0);
            }
            this.lines.push(tmp);
          }
          let coordinatesArray =[];
          for(let id of this.sequence){
            let edge = this.queryEdge(id);
            let tmp = [];
            tmp.push([edge[0][1],edge[0][0]]);
            tmp.push([edge[edge.length - 1][1],edge[edge.length - 1][0]]);
            // coordinatesArray.push(tmp);
            for(let region of this.regions(tmp)){
              this.lines[region[1]][region[0]] += 0.01;
            };
          }

          for(let line of this.lines){
            for(let item of line){
              if(item > valueMax){
                valueMax = item;
              }
            }
          }
          console.log(valueMax);

      let margin = {top: 0, right: 0, bottom: 0, left: 0};
      let width = this.$refs.heatmap.clientWidth - margin.right - margin.left,
      height = this.$refs.heatmap.clientHeight - margin.top - margin.bottom;

    this.itemWidth = this.makeItemWidth(width,this.longitudeSeparationNum);
    this.itemHeight = this.makeItemHeight(height,this.latitudeSeparationNum);
    console.log(this.itemHeight);
    // var y_elements = d3.set(this.lines.map(function( item, index ) { return index.toString(); } )).values(),
    //     x_elements = d3.set(this.lines[0].map(function( item,index ) { return index.toString(); } )).values();
    // console.log(x_elements);
    // console.log(width);
    // console.log(x_elements.length * this.itemWidth);
    // x_elements = ['1','2'];
    // console.log(this.latitudeSeparationNum);
    // console.log([this.itemWidth, width - this.itemWidth/2]);

    this.xScale = d3.scaleLinear().domain([0,this.latitudeSeparationNum]).range([this.itemWidth/2, width - this.itemWidth/2]);
    // var xAxis = d3.axisTop()
    //     .scale(xScale)
        // .tickFormat(function (d) {
        //     return d;
        // })
        // .orient("top");

    this.yScale = d3.scaleLinear();
    this.yScale.domain([0,this.longitudeSeparationNum]);
    this.yScale.range([this.itemHeight/2, height - this.itemHeight /2]);
    console.log(this.yScale(1));

    // var yAxis = d3.axisLeft()
    //     .scale(yScale)
        // .tickFormat(function (d) {
        //     return d;
        // });


    // this.colorScale = d3.scaleLinear()
    //     .domain([0, valueMax])
    //     .curve(d3.interpolateHcl)
    //   .range([d3.hsl(200,"1%","29%",0.97),d3.hsl(200, "86%", "16%",1)]);
        this.colorScale = (value)=>{
          value = value * 0.6 + 0.2;
          return d3.interpolateBlues(value/valueMax);
        }
    this.rectangleHeight = 4;
    this.rectangleWidth = 4;
    // let svg = d3.select('.heatmap')
    //     .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //     .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // let svg = d3.select("svg");
    // svg.append('rect').attr("width","4").attr("height","4").attr("x","4").attr('y',"4").attr('fill','blue');
    // let cells = svg.selectAll('rect')
    //     .data(data)
    //     .enter().append('rect')
    //     .attr('class', 'cell')
    //     .attr('width', cellSize.toString())
    //     .attr('height', cellSize.toString())
    //     .attr('y', function(d) {console.log(d.country); return yScale(d.country).toString(); })
    //     .attr('x', function(d) { return xScale(d.product).toString(); })
    //     .attr('fill', function(d) { return colorScale(d.value).toString(); });

    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis)
    //     .selectAll('text')
    //     .attr('font-weight', 'normal');
    //
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .call(xAxis)
    //     .selectAll('text')
    //     .attr('font-weight', 'normal')
    //     .style("text-anchor", "start")
    //     .attr("dx", ".8em")
    //     .attr("dy", ".5em")
    //     .attr("transform", function (d) {
    //         return "rotate(-65)";
    //     });
      },
      data(){
          return {
            xScale:null,
            yScale:null,
            colorScale:null,
            lines:[],
            rectangleWidth:0,
            rectangleHeight:0,
            itemWidth:0,
            itemHeight:0,
          }
      },
      computed:{
          regionData(){
            return [[2,2,3],[3,4,5]];
          },
        ...mapGetters({
          regions:'regions',
          queryEdge:'edgeInfo',
          longitudeSeparationNum:'longitudeSeparationNum',
          latitudeSeparationNum:'latitudeSeparationNum',
        })
        // lines() {return [[3,4],[4,4]]}
      },
      methods:{
          makeItemWidth(width,num){
            let oWidth = width / num;
            return oWidth;
          },
          makeItemHeight(height,num){
            let oHeight = height / num;
            return oHeight;
          }
      }
    }

</script>

<style>
  .heatmap{
  }
  .axis path,
  .axis line {
    fill: none;
    stroke: black;
    shape-rendering: crispEdges;
  }

  .axis text {
      font-family: sans-serif;
      font-size: 11px;
  }
</style>

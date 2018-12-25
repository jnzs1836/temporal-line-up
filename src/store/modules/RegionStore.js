import {SET_REGION_BOUNDARY} from '../MutationTypes';
const state = {
  boundary : [120.5, 119.8, 30.5, 29.6],
  latitudeSeparationNum : 4,
  longitudeSeparationNum : 4,
  latitudeSeparation : [],
  longitudeSeparation : []
};
const getters ={
  latitudeSeparationNum:state=>state.latitudeSeparationNum,
  longitudeSeparationNum:state=>state.longitudeSeparationNum,
  regions:(state)=>(pointsCoordinates)=>{
    if(state.boundary.length == 0){
      return []
    }else{
      let rectangles = pointsCoordinates.map(getRectangleCoordinates);
      let upper,lower,left,right;
      if(rectangles[0][0] < rectangles[1][0]){
        right = rectangles[1][0];
        left = rectangles[0][0];
      }else{
        right = rectangles[0][0];
        left = rectangles[1][0];
      }

      if(rectangles[0][1] < rectangles[1][1]){
        upper = rectangles[1][1];
        lower = rectangles[0][1];
      }else{
        upper = rectangles[0][1];
        lower = rectangles[1][1];
      }
      let result = []
      for(let i = lower; i <= upper; i++){
        for(let j = left; j <= right; j++){
          result.push([j,i]);
        }
      }
      return result;

      // let lower = Math.floor(state.latitudeSeparationNum *(pointsCoordinates[0][0] - state.boundary[1])/(state.boundary[0] - state.boundary[1]))
      // let upper = Math.floor(state.latitudeSeparationNum *(pointsCoordinates[0][0] - state.boundary[1])/(state.boundary[0] - state.boundary[1]))
      // let right = Math.floor(state.latitudeSeparationNum *(pointsCoordinates[0][0] - state.boundary[1])/(state.boundary[0] - state.boundary[1]))
      // let left = Math.floor(state.latitudeSeparationNum *(pointsCoordinates[0][0] - state.boundary[1])/(state.boundary[0] - state.boundary[1]))

    }
  },
  latitudeSeparation:state=>state.latitudeSeparation,
  longitudeSeparation:state=>state.longitude,
};
const mutations = {

  [SET_REGION_BOUNDARY](state,{coordinates}){
    console.log(coordinates);
    let latitudeMax = coordinates.map((value)=>value['lat']).reduce((a,b)=>a>b?a:b);
    let latitudeMin = coordinates.map((value)=>value['lat']).reduce((a,b)=>a<b?a:b);
    let longitudeMax = coordinates.map((value)=>value['lng']).reduce((a,b)=>a>b?a:b);
    let longitudeMin = coordinates.map((value)=>value['lng']).reduce((a,b)=>a<b?a:b);

    console.log(latitudeMax);
    state.boundary = [longitudeMax,latitudeMin,latitudeMax,latitudeMin];
  }
};
const actions = [

];


export default {
  state,
  getters,
  mutations,
  actions
}

function getRectangleCoordinates(coordinates) {
  let latitudeRectangle = Math.floor(state.latitudeSeparationNum *(coordinates[0] - state.boundary[1])/(state.boundary[0] - state.boundary[1]))
  let longitudeRectangle = Math.floor(state.longitudeSeparationNum *(coordinates[1] - state.boundary[3])/(state.boundary[2] - state.boundary[3]))
  if(latitudeRectangle < 0){
    latitudeRectangle = 0;
  }
  if(latitudeRectangle > state.latitudeSeparationNum){
    latitudeRectangle = state.latitudeSeparationNum - 1;
  }
  if(longitudeRectangle < 0){
    longitudeRectangle = 0;
  }
  if(longitudeRectangle > state.longitudeSeparationNum){
    longitudeRectangle = state.longitudeSeparationNum - 1;
  }
  return [latitudeRectangle,longitudeRectangle];
}

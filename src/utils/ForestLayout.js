var polynomial = require('everpolate').polynomial
import _ from 'lodash'

export function forestLayout(plans,{width,height}) {
  let tree = parsePlans(plans);
  console.log(tree);
  let segmentLen = width/(tree.layers.length+1);
  for(let layer of tree.layers){
    let segmentHeight = height /(layer.length+1);
    for(let nodeId of layer){
      console.log(nodeId);
      tree.nodes[nodeId].x = segmentLen * (tree.nodes[nodeId].layer +1);
      tree.nodes[nodeId].y = segmentHeight * (layer.indexOf(nodeId)+1)
    }
  }

  let links = []
  for(let idLink of tree.idLinks){
    links.push({source:{x:tree.nodes[idLink.source].x,y:tree.nodes[idLink.source].y},target:{x:tree.nodes[idLink.destination].x,y:tree.nodes[idLink.destination].y}})
  }
  return {
    nodes:tree.nodes,
    links:links
  };


}
function parsePlans(plans) {

  let xMax = plans.map((plan)=>plan.count).reduce((a,b)=>a>b?a:b);
  let xMin = plans.map((plan)=>plan.count).reduce((a,b)=>a<b?a:b);
  let myPlans = _.cloneDeep(plans)
  myPlans.sort((a,b)=>{
    console.log(a.count);
    return a.count>b.count
  });
  let links = [];
  let layers = []
  let count = 0;
  let nodes = [];
  for(let plan of myPlans){
    if(plan.planType === "fromMerging"){
      if(layers.length === 0){
        layers.push([])
      }
      layers[0].push(count);
      let node = {layer:0,children:[],count:0,id:count,key:plan.key};
      nodes.push(node);
      continue;
    }
    if(plan.count===0){
      if(layers.length === 0){
        layers.push([])
        layers[0].push(count);
      }else{
          layers[0].push(count);
      }
      let node = {layer:0,children:[],count:0,id:count,key:plan.key};
      nodes.push(node);


    }else{
      let parentSeq = findParent(plan,myPlans);
      console.log(parentSeq);
      links.push({source:parentSeq,destination:count});
      let node = {layer:nodes[parentSeq].layer + 1,children:[],count:plan.count,id:count,key:plan.key};
      console.log(nodes);

      if(layers.length <= node.layer ){
        layers.push([]);
      }
      layers[node.layer].push(count);
      nodes[parentSeq].children.push(count);
      nodes.push(node);

    }

    count++;
  }
  let num = myPlans.length;
  return {
    nodes:nodes,
    layers:layers,
    idLinks:links
  }
  // let nodes = plans.map((plan)=>{
  //   return {x:}
  // })
}
function dealWithMergingGeneratedPlan() {

}
function isParent(plan1,plan2) {
  if(plan1.initializationVersion !==plan2.initializationVersion){
    return false;
  }
  if(plan2.count === 0){
    return true;
  }
  for(let operationSeq in plan2.operationHash){
    if(operationSeq+1=== plan2.operationHash.length){
      console.log(operationSeq);
      break;
    }
  }
  let plan1Last = plan1.operationHash[plan2.operationHash.length - 1];
  let plan2Last = plan2.operationHash[plan2.operationHash.length - 1];
  let c = plan1Last ^ plan2Last;
  let trigger = 0;
  for(let i  = 0; i < plan2.count; i++){
    trigger += 2*i;
  }
  c = c & trigger;
  console.log(plan1Last);
  console.log(plan2Last);
  console.log(c);
  if(c === 0){
    return true;
  }
  return false;

}
function findParent(plan,planSequence,) {
  let order = planSequence.indexOf(plan);
  console.log(order);
  for(let i = order - 1; i >= 0; i--){
    if(isParent(plan,planSequence[i])){
      return i;
    }
  }
}

function operationHashLength(operationHash){
  let sequenceLength = operationHash.length;
  operationHash[sequenceLength-1];

}



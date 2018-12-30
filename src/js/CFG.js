import * as escodegen from 'escodegen';
const esgraph = require('esgraph');
import * as esprima from 'esprima';
import {symbolicSubstitutionn} from './symbolicSubstitution';

export {createCFG};

let currentNumber=1;
let mergedNodes=new Map(); //helps to avoid overriding a merged node
let conditionsResult=new Map();
let hadCondition=false;
let notToBeMerged=[]; //statements that appear STRAIGHT after ELSE -> they are not mergable
let conditionsType=new Map();
let finalGraph='';


function init(){
    currentNumber=1;
    //graphLines=[];
    mergedNodes=new Map();
    conditionsResult=new Map(); // <cond, true/false>
    hadCondition=false;
    notToBeMerged=[];
    conditionsType=new Map(); //<condition, type(while,if..)>
    finalGraph='';
}

function createCFG(codeToParse,table,input) {
    init();
    let parsedCode=esprima.parseScript(codeToParse, {range:true});
    let cfg = esgraph(parsedCode.body[0].body, { range: true });
    const graphObject = esgraph.dot(cfg, { counter: 0, source: codeToParse });
    let graphLines = graphObject.split('\n');
    findUnMergable(codeToParse); //update graph - merge, index nodes, shape
    graphLines = updateGraph(graphLines);
    let colorHelp = symbolicSubstitutionn(codeToParse, input, table);// color graph
    MakeConditionsResult(colorHelp);
    graphLines=colorGraph(graphLines);
    graphLines = indexNodes(graphLines);//add index to each node
    graphLines = removeExit(graphLines); //remove exit node
    finalGraph=''; //display the graph
    for (let i=1; i<graphLines.length; i++){
        finalGraph=finalGraph+graphLines[i]+'';
        if (i<graphLines.length-1)
            finalGraph=finalGraph+'\n';
    }
    return finalGraph;   }



function findUnMergable(codeToParse){
    let code=codeToParse.split('\n');
    for (let i=0; i<code.length; i++){
        let line=code[i];
        //else (NOT else if) OR statements that comes after }
        startFinding(line,i,code);
    }

}

function startFinding(line,i,code){
    if ((line.includes('else') && !line.includes('else if')) || (line.includes('}') && !line.match(/[a-z]/i) )){
        i=skipThisPoint(i,code);
        addUMergable(i,code);
    }
}

function skipThisPoint(i,code){
    while (i + 1 < code.length && !code[i + 1].match(/[a-z]/i)) { //if empty line
        i++;
    }
    return i;
}

function addUMergable(i,code){
    if (i+1<code.length) {
        let temp=code[i+1].replace(/\s/g, '');
        if (temp.length>1)
            helper(i,temp,code);
    }
}

function helper(i,temp,code){
    if (temp.substring(0,6)!='return' && !temp.includes('while')&& !temp.includes('if') && !temp.includes('else')) {
        let unMergable = code[i + 1];
        unMergable = esprima.parseScript(unMergable + '');
        unMergable = escodegen.generate(unMergable); //convert from JSON to string
        unMergable = unMergable.replace(';', '');
        notToBeMerged.push(unMergable);
    }


}
function MakeConditionsResult(colorHelp){
    let finalCode = colorHelp[0];
    let ifElseStatements = colorHelp[1];
    let temp_conditions_type = colorHelp[2];
    for (let [k, v] of ifElseStatements) {
        let condition_line_num =k;
        let result = v;
        let condLine =finalCode[condition_line_num].Line;
        condLine=condLine.substring(condLine.indexOf('(')+1,condLine.lastIndexOf(')'));
        conditionsResult.set(condLine,result); // <cond, true/false>
        conditionsType.set(condLine,temp_conditions_type.get(k));
    }

}

function colorGraph(graphLines){
    let firstCond=conditionsResult.keys().next().value;
    let lineResult = conditionsResult.get(firstCond);
    conditionsResult.delete(firstCond);
    let condType = conditionsType.get(firstCond);
    conditionsType.delete(firstCond);
    for (let i=1; i<graphLines.length ; i++){
        let label = getLabel(graphLines[i]);
        if (label==firstCond){
            graphLines[i] =colorNode(graphLines[i]);
            hadCondition=true;
            let node_name = getNodeNumber(graphLines[i]);
            let nextNode = getCondNextNode(graphLines,node_name,lineResult);
            let nextNode_line = getNodeLine(graphLines,nextNode);
            graphLines[nextNode_line] =colorNode(graphLines[nextNode_line]);
            graphLines=recursiveColoring(graphLines,nextNode, graphLines[nextNode_line]);
            graphLines= whileColorFirst(graphLines,condType,node_name);    }
        graphLines[i]=colorFirstNormal(graphLines[i]);
    }
    return graphLines;   }


function whileColorFirst(graphLines,condType,node_name){
    if (condType=='while statement'){
        let nextNode = getCondNextNode(graphLines,node_name,false); //if while ALWAYS color false
        let nextNode_line = getNodeLine(graphLines,nextNode);
        graphLines[nextNode_line] =colorNode(graphLines[nextNode_line]);
        graphLines=recursiveColoring(graphLines,nextNode, graphLines[nextNode_line]);
    }
    return graphLines;
}
function colorFirstNormal(line){
    if (!hadCondition && !line.includes('->') && line!='') //lines before any condition
        line =colorNode(line);
    return line;

}

//every node that is pointed by a colored node-> will be colored
function recursiveColoring(graphLines,coloredNode, coloredNode_line){
    //if the colored node is condition
    if (isCond(coloredNode_line)){
        graphLines=recursiveColorCondition(coloredNode_line,graphLines,coloredNode);

    }
    //normal colored node
    else{
        graphLines=recursiveColorNormal(graphLines,coloredNode);
    }
    return graphLines;
}


function recursiveColorCondition(coloredNode_line,graphLines,coloredNode){
    let label = getLabel(coloredNode_line);
    let firstCond='', lineResult='';
    for (let [cond, line] of conditionsResult) {
        if (label==cond) {     firstCond=cond; lineResult=line;   }   }
    if (firstCond=='') //if didn't found it (been in this condition-went beck to while)
        return graphLines;
    let condType = conditionsType.get(firstCond);
    conditionsResult.delete(firstCond);
    conditionsType.delete(firstCond);
    let nextNode = getCondNextNode(graphLines,coloredNode,lineResult);
    let nextNode_line = getNodeLine(graphLines,nextNode);
    graphLines[nextNode_line] =colorNode(graphLines[nextNode_line]);
    graphLines= recursiveColoring(graphLines, nextNode,graphLines[nextNode_line]);
    if (condType=='while statement'){
        let nextNode = getCondNextNode(graphLines,coloredNode,false); //if while ALWAYS color false
        let nextNode_line = getNodeLine(graphLines,nextNode);
        graphLines[nextNode_line] =colorNode(graphLines[nextNode_line]);
        graphLines=recursiveColoring(graphLines,nextNode, graphLines[nextNode_line]);  }
    return graphLines;  }



function recursiveColorNormal(graphLines,coloredNode){
    let nextNode = getNextNode(graphLines, coloredNode);
    if (nextNode!='NoNext')
    {
        let nextNode_line = getNodeLine(graphLines, nextNode);
        graphLines[nextNode_line] = colorNode(graphLines[nextNode_line]);
        graphLines = recursiveColoring(graphLines, nextNode, graphLines[nextNode_line]);
    }
    return graphLines;
}
function isCond(line){
    let ans=false;
    // if (line.includes('shape=')){
    if (line.includes('=diamond'))
        ans=true;
    //  }
    return ans;
}

//get next node of cond node
function getCondNextNode(graphLines,cond_node_name,result){
    let pointed='';
    for (let i=0; i<graphLines.length; i++){
        let line=graphLines[i];
        var  index = line.indexOf(cond_node_name+ ' ->');
        if (index>-1 && getLabel(line)==result+'') {
            pointed=line.substring(line.indexOf('-> ')+3,line.lastIndexOf(' ['));
            return pointed;
        }
    }
}


//get next node of UN cond node
function getNextNode(graphLines,cond_node_name){
    let pointed='';
    for (let i=0; i<graphLines.length; i++){
        let line=graphLines[i];
        var  index = line.indexOf(cond_node_name+ ' ->');
        if (index>-1) {
            pointed = line.substring(line.indexOf('-> ') + 3, line.lastIndexOf(' ['));
            return pointed;
        }
    }
    return 'NoNext'; //doesn't have next
}
//color a node in the path
function colorNode(line){
    if (!line.includes('fillcolor=')) { //if node not colored
        let endIndex = line.lastIndexOf(']');
        line = line.substring(0, endIndex) + ',style=filled,fillcolor=green' + line.substring(endIndex);
    }
    return line;

}

function getNodeLine(graphLines,node_name){
    for (let i=0; i<graphLines.length; i++) {
        let line=graphLines[i];
        if (line.substring(0,line.indexOf(' ['))==node_name)
            return i;
    }
}

function updateGraph(graphLines){
    graphLines = removeStart('n0',graphLines); //remove start node
    for (let i=1; i<graphLines.length; i++){
        let line = graphLines[i];
        let label = getLabel(line);
        let oldName = getNodeNumber(line);
        let parsedLine='';
        if (label=='exit') //if end, remove exit's connections
            return removeStart(oldName,graphLines) ; //remove exit..
        parsedLine = findParsed(parsedLine,label);
        if (label.substring(0,6)=='return'){
            graphLines = updateReturnNode(graphLines,i,line,oldName);
            continue;
        }
        else{ //condition or normal node:
            let toReturn = keepUpdating(graphLines,i,oldName,label,line,parsedLine);
            graphLines = toReturn[0];
            i = toReturn[1];
        }
    }}



function keepUpdating(graphLines,i,oldName,label,line,parsedLine){
    let toReturn=[];
    //if condition - only update node's number
    if (parsedLine=='' || ( parsedLine.body.length==1 && parsedLine.body[0].expression!=null && parsedLine.body[0].expression.type=='BinaryExpression')){
        graphLines = updateCondNode(graphLines,i,oldName,line);
        toReturn[0]=graphLines;
        toReturn[1]=i;
        return toReturn;
    }

    else{
        toReturn =  updateNormalNode(graphLines,i,oldName,label);
        return toReturn;
    }
}
function findParsed(parsedLine,label){
    if (!label.includes('return') || label.includes('->'))
    {
        parsedLine = esprima.parseScript(label + ';');
    }
    return parsedLine;
}
function updateReturnNode(graphLines,i,line,oldName){
    graphLines[i-1]=graphLines[i-1].replace(new RegExp('let', 'g'), ''); //remove let from previosu node..
    graphLines[i-1]=graphLines[i-1].replace(new RegExp(';', 'g'), ''); //remove let from previosu node..
    currentNumber=parseInt(getPreviousNumber(graphLines,i))+1;
    let new_node_name = 'n'+currentNumber;
    graphLines[i]=addShape(line,'normal');
    graphLines[i]=graphLines[i].replace(oldName,new_node_name); //replace with merged name
    graphLines[i]=graphLines[i].replace(new RegExp(';', 'g'), ''); //remove let from previosu node..
    graphLines = replaceWithNewNode(oldName,new_node_name,graphLines);

    return graphLines;

}

function updateCondNode(graphLines,i,oldName,line){
    graphLines[i-1]=graphLines[i-1].replace(new RegExp('let', 'g'), ''); //remove let from previosu node..
    currentNumber=parseInt(getPreviousNumber(graphLines,i))+1;
    let new_node_name = 'n'+currentNumber;
    graphLines[i]=addShape(line,'condition');
    graphLines[i]=graphLines[i].replace(oldName,new_node_name); //replace with merged name
    graphLines = replaceWithNewNode(oldName,new_node_name,graphLines);

    return graphLines;
}


function updateNormalNode(graphLines,i,oldName,label){
    currentNumber=parseInt(getPreviousNumber(graphLines,i))+1;
    graphLines[i]=addShape(graphLines[i],'normal'); //add shape
    //line=graphLines[i];
    let toReturn=[];
    if (i<graphLines.length-1){
        toReturn = checkIfToMerge(graphLines,i,oldName,label);
        let index = toReturn[1];
        graphLines[index]=graphLines[index].replace(new RegExp('let', 'g'), ''); //remove let
        graphLines[index]=graphLines[index].replace(new RegExp(';', 'g'), ''); //remove let from previosu node..
        toReturn[0]=graphLines;
    }

    return toReturn;

}


function checkIfToMerge(graphLines,i,oldName,label){
    let nextLine=graphLines[i+1], label_2 =getLabel(nextLine), toReturn=[] ;
    if (isLetStatement(label) && isLetStatement(label_2) && !notToBeMerged.includes(label_2)){ //if need to unite labels
        let merged_label=label+'\n'+label_2; //merge lET labels
        let merged_nodeName = 'n'+currentNumber;
        graphLines[i]=graphLines[i].replace(label,merged_label); //replace with merged label
        graphLines[i]=graphLines[i].replace(oldName,merged_nodeName); //replace with merged name
        graphLines[i]=graphLines[i].replace(';',''); //remove ';'
        graphLines.splice(i+1, 1); //remove the next node
        graphLines = removeItem(getNodeNumber(nextLine),merged_nodeName,graphLines); //change pointers
        graphLines = replaceWithNewNode(oldName,merged_nodeName,graphLines);
        mergedNodes.set(merged_nodeName,''); //add to merged nodes
        i--;  }
    else if (!mergedNodes.has(oldName)) { //if a single normal statement, doesnt  need to combine with next-> just update number
        let new_node_name = 'n'+currentNumber;
        graphLines[i]=graphLines[i].replace(oldName,new_node_name); //replace with merged name
        graphLines = replaceWithNewNode(oldName,new_node_name,graphLines);  }
    toReturn.push(graphLines);
    toReturn.push(i);
    return toReturn;    }



// add index to each node
function indexNodes(graphLines){
    for (let i=0; i<graphLines.length; i++){
        graphLines[i] = addNumber(graphLines[i]);
    }
    return graphLines;
}

function addNumber(line){
    let labelIndex=line.indexOf('label=');
    if (labelIndex>-1 && !line.includes('->')){ //if exists label
        let node_name = getNodeNumber(line);
        let node_number = node_name.substring(node_name.indexOf('n')+1);
        let lable = getLabel(line);
        let newLabel = '('+node_number+')\n'+lable;
        line=line.replace(lable,newLabel);
    }
    return line;
}


function addShape(line,kind){
    let shapeKind='';
    if (kind=='normal')
        shapeKind='box';
    else
        shapeKind='diamond';

    if (!line.includes('shape='+shapeKind)){ //if doesn't have a shape yet
        let endIndex=line.lastIndexOf(']');
        line=line.substring(0, endIndex)+',shape='+shapeKind+line.substring(endIndex);
    }
    return line;
}


function getLabel(line){
    let labelIndex=line.indexOf('label=');
    if (labelIndex>-1) { //if exists label
        labelIndex+=6;
        line=line.substring(labelIndex);
        line=line.substring(line.indexOf('"')+1); //get off first "
        line=line.substring(0, line.indexOf('"')); //get off next "


        if (line.charAt(line.length-1)==';')
            line=line.substring(0,line.length-1);
    }
    return line;
}

//if let or assignment
function isLetStatement(line){
    let isLet=false;
    if (line.substring(0,3)=='let' || line.includes('++')|| line.includes('--')) { //let or has ONE '='
        isLet=true;
    }
    else if (line.includes('=')){
        isLet = keepCheckingIfLet(line);
    }
    return isLet;
}

function keepCheckingIfLet(line){
    if (!line.includes('==') && !line.includes('>=') && !line.includes('<=') && !line.includes('!=') )
        return true;
    return false;

}
function getNodeNumber(line){
    let number=line.substring(0,line.indexOf(' '));
    return number;
}

//remove node from connections
function removeItem(removed_nodeName, pointer_nodeName,graphLines){
    let toBePointed='';
    for (let i=0; i<graphLines.length; i++){
        let line=graphLines[i];
        var index = line.indexOf('-> '+removed_nodeName);
        if (index > -1) { //if found the connection name
            graphLines.splice(i, 1);
            i--;
        }
        index = line.indexOf(removed_nodeName+ ' ->');
        if (index>-1) {
            graphLines.splice(i, 1);
            toBePointed=line.substring(line.indexOf('-> '));
            graphLines.push(pointer_nodeName+' '+toBePointed);
            i--; //we removed item so index changed. so we dont miss item
        }
    }
    return graphLines;
}

//get the node number of the previous node
function getPreviousNumber(graphLines,i){
    let previousNode = getNodeNumber(graphLines[i-1]);
    return previousNode.substring(previousNode.indexOf('n')+1);

}
function replaceWithNewNode(name_before_merge, name_after_merge,graphLines){
    for (let i=0; i<graphLines.length; i++){
        let line=graphLines[i];
        var index = line.indexOf('-> '+name_before_merge);
        if (index > -1) //if found the connection name
            graphLines[i]=graphLines[i].replace(name_before_merge, name_after_merge);

        index = line.indexOf(name_before_merge+ ' ->');
        if (index>-1) {
            graphLines[i]= graphLines[i].replace(name_before_merge, name_after_merge);

        }
    }
    return graphLines;
}


//remove n0 connection nodes;
function removeStart(n0,graphLines){
    for (let i=0; i<graphLines.length; i++){
        let line=graphLines[i];
        var index = line.indexOf('-> '+n0);
        if (index > -1) { //if found the connection name
            graphLines.splice(i, 1);
            i--;
        }
        index = line.indexOf(n0+ ' ->');
        if (index>-1) {
            graphLines.splice(i, 1);
            i--; //we removed item so index changed. so we dont miss item
        }
    }

    return graphLines;
}

//remove exit node (already removed its connections)
function removeExit(graphLines){
    for (let i=0; i<graphLines.length; i++){
        let line=graphLines[i];
        let label=getLabel(line);
        if (label.includes('exit')){
            graphLines.splice(i, 1);
            continue;
        }
    }
    return graphLines;
}
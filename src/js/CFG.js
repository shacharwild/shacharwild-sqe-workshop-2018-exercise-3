const esgraph = require('esgraph');
import * as esprima from 'esprima';
import * as viz from 'viz.js';
import {symbolicSubstitutionn} from './symbolicSubstitution';
export {createCFG};

let currentNumber=1;
let graphLines=[];
let mergedNodes=new Map(); //helps to avoid overriding a merged node
/*
const statementType = {
    'VariableDeclaration' : handleNormal,
    'AssignmentExpression': handleNormal,
    'IfStatement': handleCond
};
*/

function init(){
    currentNumber=1;
    graphLines=[];
    mergedNodes=new Map();

}

function createCFG(codeToParse,table,input) {
    init();
    let parsedCode=esprima.parseScript(codeToParse, {range:true});
    let cfg = esgraph(parsedCode.body[0].body, { range: true });
    const graphObject = esgraph.dot(cfg, { counter: 0, source: codeToParse });
    let graphLines = graphObject.split('\n');

    //update graph
    graphLines = updateGraph(graphLines);
    //display the graph
    let d='';
    for (let i=1; i<graphLines.length; i++){
        d=d+graphLines[i]+'';
        if (i<graphLines.length-1)
            d=d+'\n';
    }
    let  v= viz('digraph{'+d+'}');
    return v;
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
        if (!label.includes('return') || label.includes('->'))
        {
            parsedLine = esprima.parseScript(label + ';');
        }
        //if condition - only update node's number
        if (parsedLine=='' || ( parsedLine.body.length==1 && parsedLine.body[0].expression!=null && parsedLine.body[0].expression.type=='BinaryExpression')){
            graphLines[i-1]=graphLines[i-1].replace(new RegExp('let', 'g'), ''); //remove let from previosu node..
            currentNumber=parseInt(getPreviousNumber(graphLines,i))+1;
            let new_node_name = 'n'+currentNumber;
            graphLines[i]=addShape(line,'condition');
            graphLines[i]=graphLines[i].replace(oldName,new_node_name); //replace with merged name
            graphLines = replaceWithNewNode(oldName,new_node_name,graphLines);
        }
        else{
            currentNumber=parseInt(getPreviousNumber(graphLines,i))+1;
            graphLines[i]=addShape(graphLines[i],'normal'); //add shape
            line=graphLines[i];
            if (i<graphLines.length-1){
                let nextLine=graphLines[i+1];
                let label_2 = getLabel(nextLine);
                if (isLetStatement(label) && isLetStatement(label_2)){ //if need to unite labels
                    let merged_label=label+'\n'+label_2; //merge lET labels
                    let merged_nodeName = 'n'+currentNumber;

                    graphLines[i]=graphLines[i].replace(label,merged_label); //replace with merged label
                    graphLines[i]=graphLines[i].replace(oldName,merged_nodeName); //replace with merged name
                    graphLines[i]=graphLines[i].replace(';',''); //remove ';'

                    graphLines.splice(i+1, 1); //remove the next node
                    graphLines = removeItem(getNodeNumber(nextLine),merged_nodeName,graphLines); //change pointers
                    graphLines = replaceWithNewNode(oldName,merged_nodeName,graphLines);
                    mergedNodes.set(merged_nodeName,''); //add to merged nodes
                    i--;
                }
                else if (!mergedNodes.has(oldName)) { //if a single normal statement, doesnt  need to combine with next-> just update number
                    let new_node_name = 'n'+currentNumber;
                    graphLines[i]=graphLines[i].replace(oldName,new_node_name); //replace with merged name
                    graphLines = replaceWithNewNode(oldName,new_node_name,graphLines);
                }
            }

        }
    }
    return graphLines;
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
    if (line.substring(0,3)=='let' || (line.includes('=') && !line.includes('==')) || line.includes('++')|| line.includes('--')) //let or has ONE '='
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

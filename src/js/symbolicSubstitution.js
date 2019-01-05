import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let globals = new Map();
let statements=[];
let functionArgs=[];
let input='';  //input of the args (values)
let finalCode=[];
var code=[];
let countOld;
let funcFlag=false; //checks if in function
let countInitVars; //for cases such as: let a,b,c
let newVarLine;
let operators='/+-* ';
let kaleidoStar=[];

let ifElseLines = new Map(); // <number of line, true/false>

let countStatements; //counts the number of statements
let numArgs=0; //counts how many function's args there r
let argsSoFar=0; //how many args we've been to SO FAR
let globalsOutIndex=0;
let vars=[]; //vars that are right of the =


let conditionsType =new Map();


const statementType = {
    'variable declaration' : handleVarDec,
    'else statement': handleIf,
    'while statement': handleIf,
    'if statement': handleIf,
    'else if statement': handleIf,
    'return statement': handleReturn,
    'assignment expression': handleAssignment,
    'update expression': handleUpdate
};

const arrVarType = {
    'MemberExpression' : computedArr,
    'Identifier': IdentifierArr,
    'BinaryExpression': binaryarr,
    'Literal': literalArr
};

const valueVars = {
    'BinaryExpression' : binaryVar,
    'Identifier': otherVar,
    'Literal': otherVar,
    'ArrayExpression': otherVar,
    'MemberExpression': otherVar,
    'UnaryExpression': otherVar
};



//export {insertArgsValues};
export {ifElseLines};
export{convertToString};
export {symbolicSubstitutionn};

function countArgs(){
    for (let i=0; i<statements.length; i++){
        if (statements[i].Type=='variable declaration' && statements[i].Value===''){
            numArgs++;
        }
    }
}
function symbolicSubstitutionn(codeToParse, givenInput, resultt){
    let locals = new Map(); //local vars for each scope
    init();
    input=givenInput;
    code=codeToParse.split('\n');
    statements=resultt;
    countArgs(); //count how many function args there are

    bodyLines(code.length, locals); //goes through all statements.

    addRestOfCode(finalCode);
    //return finalCode;
    let colorHelp = [];
    colorHelp.push(finalCode);
    colorHelp.push(ifElseLines);
    colorHelp.push(conditionsType);
    colorHelp.push(finalCode);
    return colorHelp;
}

function init(){
    numArgs=0; //counts how many function's args there r
    argsSoFar=0; //how many args we've been to SO FAR
    globalsOutIndex=0;
    functionArgs=[];
    globals=new Map();
    statements=[];
    ifElseLines = new Map();
    code=[];
    countInitVars=1; //how many vars are declared in a row
    countOld=0;
    finalCode=[];
    funcFlag=false; //checks if im in a function or not
    newVarLine=true; //if a new var declaration line
    countStatements=0;
    input='';
    vars=[];
    conditionsType =new Map();

}
function countEndFunction(){ //find the end index of function
    for (let i=code.length-1; i>=0 ; i--){
        let line=code[i];
        if (line.includes('}')) { //end function
            globalsOutIndex = i;
            break;
        }}
}
function bodyLines(endBlock, locals){
    while (countOld<endBlock && countStatements<statements.length){
        let statement = statements[countStatements];
        skipEmptyLines(finalCode); //skip empty lines or add lines with only '}'
        if (countOld>=endBlock)
            continue;

        if (statement.Type == 'FunctionDeclaration') {
            funcFlag = addFunctionDec(funcFlag, finalCode);
            countStatements++; //next statement
            continue;
        }
        countStatements++;
        statementType[statement.Type](statement, locals); //handle each type of statement
    }
}

function checkIfToInsertInput(){
    if (argsSoFar==numArgs)
        insertArgsValues(input);
}

function insertOutsideGlobals(){
    for (let i=globalsOutIndex; i<code.length ;i++){
        let line=code[i];
        if (line.includes('let')){ // if var dec outside the function
            let left=line.substring(line.indexOf('let')+4, line.indexOf('='));
            left=left.replace(/\s/g, '');
            let right=line.substring(line.indexOf('=')+1,line.lastIndexOf(';'));
            right=right.replace(/\s/g, '');
            globals.set(left + '', right);
        }
    }
}

//1
function handleVarDec(statement, locals) {
    if (statement.Value === '') { //if it's arguments of the function
        globals.set(statement.Name + '', '');
        functionArgs.push({arg: statement.Name + ''});
        argsSoFar++;
        checkIfToInsertInput();}
    else if (funcFlag == true) {
        var newValue = '';
        if (countOld < globalsOutIndex) { //if local var (inside the function)
            newValue = insertLocal(statement.Name, statement.Value + '', finalCode, locals);
            newValue=calculate (newValue);
            locals.set(statement.Name + '', newValue);
            countOld++;}
        else { //if AFTER the function - end globals
            finalCode.push({Line: code[countOld]});
            countOld++;}}
    else { //outside the function - before the function
        globals.set(statement.Name + '', statement.Value);
        finalCode.push({Line: code[countOld]});
        countOld++;   }}


//2
function handleElse(statement, locals){
    kaleidoStar.push({sora:statement, layla:locals});
    var elseStart=code[countOld];
    finalCode.push({Line: elseStart});
    countOld++;
}

//3
function handleConditionStatement(statement,locals) {
    let newCondition = handleCondition(esprima.parseScript(statement.Condition + ''), finalCode, true, locals);
    //var close='';
    //if (code[countOld][code[countOld].length-1]=='{')
    //    close='{';
    //finalCode.push({Line: code[countOld].substring(0, code[countOld].indexOf('(')) + '(' + newCondition + ')'+close});
    finalCode.push({Line: code[countOld]});
    countOld++;
    // if (statement.Type == 'if statement' || statement.Type == 'else if statement' || statement.Type == 'while statement') {
    var condtionResult = conditionResult(newCondition);
    ifElseLines.set((finalCode.length - 1) + '', condtionResult);
    conditionsType.set((finalCode.length - 1) + '',statement.Type);
    //}
}

//4
function handleReturn(statement, locals) {
    var returnStart = code[countOld].substring(0, code[countOld].indexOf('return') + 6);
    if (globals.has(statement.Value)) {
        countOld++;
        finalCode.push({Line: returnStart + ' ' + statement.Value + ';'});
    }
    else {
        var newValue = returnStatement(statement.Value + '', locals);
        kaleidoStar.push({sora:'', layla:newValue});
        //finalCode.push({Line:returnStart+' '+newValue+';'});}
        finalCode.push({Line: returnStart + ' ' + statement.Value+ ';'});
    }
}
//5
function handleAssignment(statement, locals){
    var assStart=code[countOld].substring(0, code[countOld].indexOf('='));
    finalCode.push({Line: assStart + '=' + statement.Value + ';'});
    var newValue = assignmentLocal(statement.Name, statement.Value + '', locals); //check right side
    if (checkIfComputed(assStart)==true) { //if left is computed value
        let arrName=assStart.substring(0,assStart.indexOf('['));
        arrName=arrName.replace(/\s/g, '');
        var computedLeft = checkComputedValue(assStart+'', locals).computedValue; //replace computed left side
        if (globals.has(computedLeft.substring(0,computedLeft.indexOf('[')))){ //if left is global
            replaceArrayValue(computedLeft, newValue,globals, arrName);
        }
        if (locals.has(arrName)) //if left is local
            replaceArrayValue(computedLeft,newValue,locals, arrName);   }
    else { //if left is not computed value, only regular var -> x=5;
        newValue=calculate(newValue);
        if (globals.has(statement.Name)) {
            globals.set(statement.Name + '', newValue); }
        else {
            locals.set(statement.Name + '', newValue);
        }}}



//check if leftSide is computedValue
function checkIfComputed(value){
    //   if (canBeparsed(value)) {
    var parsedValue = esprima.parseScript(value + '');
    if (parsedValue.body[0].expression.type=='MemberExpression')
        return true;
    // }
    return false;
}

function replaceArrayValue(left,newValue, dic, arrName){
    let right,index='';
    if (dic==globals) {// the global var that comes here stays as it is (x)
        right = dic.get(left.substring(0, left.indexOf('['))); //get array value [1,2,3]
        index = left.substring(left.indexOf('[') + 1, left.indexOf(']')); //in this index i want to replace the value in the array
    }
    else{ //if LOCALS- the local var that comes here is in its VALUE form (x -> [1,1,1]
        right = left.substring(0,left.indexOf(']')+1); //the []  will be removed in 3 rows
        index= left.substring(left.lastIndexOf('[')+1,left.lastIndexOf(']'));}
    right=right.substring(1, right.length-1); //remove [ and ]
    var arr=right.split(','); index = updateIndex(index,globals);
    index=eval(index);
    arr[index]=newValue;
    right='[';
    for (let i=0; i<arr.length ;i++){
        right+=arr[i];
        if (i<arr.length-1)
            right+=','; }
    right+=']';
    dic.set(arrName, right); }

function updateIndex(value, locals){
    vars=[];
    value=escodegen.generate(esprima.parseScript(value+'').body[0].expression);
    value=value.replace(/\s/g, '');
    valueVars[esprima.parseScript(value+'').body[0].expression.type](esprima.parseScript(value+'').body[0].expression);
    for (let i=0; i<vars.length;i++){
        let check=vars[i]+'';
        value = updateAssNewValue(check,locals,value);   }//update value line

    value=value.replace(/\s/g, '');
    return value;
}

/*
function replaceIndex(index){
    // if (locals.has(index))
    //     index=locals.get(index);
    if (globals.has(index))
        index=globals.get(index);
    return index;
}
*/

//6
function handleIf(statement, locals){
    var endBlock=findNewBlock();
    var newLocals = localsToTemp(locals);

    if (statement.Type=='else statement') //if its else statement
        handleElse(statement,locals);
    else
        handleConditionStatement(statement, newLocals); // while/if/ else if

    bodyLines(endBlock, newLocals);

}

//7
function handleUpdate(statement,locals){
    let operator='';
    if (statement.Value.includes('+'))
        operator='+';
    else
        operator='-';

    if (locals.has(statement.Name)){ //left is local
        let right=locals.get(statement.Name)+operator+'1';
        locals.set(statement.Name, right);
    }
    else { //left is global
        let right=globals.get(statement.Name)+operator+'1';
        globals.set(statement.Name,right);
        finalCode.push({Line: code[countOld]});
    }
    countOld++;
}


function findNewBlock() {
    var currentLine=code[countOld];
    var lastIndex = currentLine[currentLine.length-1];
    var countTemp = countOld+1 ;
    var temp = (code[countTemp]);
    var pairs=0;

    if (lastIndex=='{'){
        pairs++;
    }
    if (temp.includes('{')){
        pairs++;
        countTemp++;
    }
    temp=code[countTemp];
    countTemp = searchEndBlock(pairs,temp,countTemp);
    return countTemp; //end index of block
}

function searchEndBlock(pairs, temp, countTemp){
    while (pairs>0) {
        if (temp.includes('}'))
            pairs--;
        if (pairs==0)  //found end of block
            break;
        if (temp.includes('{'))
            pairs++;

        countTemp++;
        temp=code[countTemp];
    }
    return countTemp;
}

function handleCondition(condition, finalCode, firstTime,locals) {
    var left, right = [];
    var operator = '';
    if (firstTime) {
        if ((condition.body)[0].expression.type == 'BinaryExpression' || (condition.body)[0].expression.type == 'LogicalExpression') {
            operator = (condition.body)[0].expression.operator;
            left = (condition.body)[0].expression.left;
            right = (condition.body)[0].expression.right;
            var addLeft = handleLeft(left, locals);   //left
            var addRight = handleRight(right, locals); //right
            return addLeft + ' ' + operator + ' ' + addRight;
        }
        else if ((condition.body)[0].expression.type == 'MemberExpression')
            return memberExpressionValue((condition.body)[0].expression, locals);
        else //Identifier  -> if (sora)
            return IdentifierValue((condition.body)[0].expression, locals);
    }
    else {
        return NotFirstTime(condition, locals); } }

function NotFirstTime(condition, locals){
    let left,right,operator='';
    if (condition.type=='BinaryExpression'){
        left=condition.left;
        right=condition.right;
        operator=condition.operator;
        var addLeft=handleLeft(left,locals);   //left
        var addRight=handleRight(right,locals); //right
        return addLeft+' '+operator+' '+addRight;
    }
    else //other typs- identifier, etc
        return IdentifierValue(condition,locals);
}
function handleLeft(left,locals){
    var addLeft='';

    if (left.type=='UnaryExpression'){
        addLeft = left.operator+''+handleLeft(left.argument,locals);
    }

    if (left.type=='BinaryExpression') {//if left is binaryExpression
        addLeft = '('+handleCondition(left, finalCode, false, locals)+')';
    }
    else if (left.type=='MemberExpression'){
        addLeft=memberExpressionValue(left,locals);
    }
    else{
        addLeft=continueCheckLeft(left,locals,addLeft);
    }


    return addLeft;
}

function continueCheckLeft(left,locals,addLeft){
    if (left.type=='Identifier') {
        addLeft=left.name;

        if (locals.has(addLeft)) {
            addLeft = locals.get(addLeft);
        }
        return addLeft;
    }
    else if (left.type=='Literal') { //literal
        return left.value + '';
    }
    return addLeft;
}

function checkIfString(value){
    if (/^[a-zA-Z]+$/.test(value) && !globals.has(value) && value!='true' && value!='false')
        return '"'+value+'"';
    return value;

}
function handleRight(right,locals){
    var addRight='';

    if (right.type=='UnaryExpression'){
        addRight = right.operator+''+handleLeft(right.argument,locals);
    }

    if (right.type=='BinaryExpression') {//if left is binaryExpression
        addRight = '('+handleCondition(right, finalCode, false, locals)+')';
    }
    else if (right.type=='MemberExpression'){
        addRight=memberExpressionValue(right,locals);
    }
    else{
        addRight=continueCheckRight(right,locals,addRight);
    }

    return addRight;
}

function continueCheckRight(right,locals, addRight){
    if (right.type=='Identifier') {
        addRight=right.name;

        if (locals.has(addRight)) {
            addRight = locals.get(addRight);
        }
        return addRight;
    }
    else if (right.type=='Literal') { //literal
        return right.value + '';
    }
    return addRight;
}
function IdentifierValue(value,locals){
    if (value.type=='Identifier') {
        if (locals.has(value.name))
            return locals.get(value.name);
        return value.name;
    }
    if (value.type=='Literal'){//literal (while)true))
        return value.value;
    }
    else{ //unary expression
        return handleLeft(value,locals);}

}
function memberExpressionValue(value,locals){
    var object=value.object.name;
    if (locals.has(object))
        object=locals.get(object);

    return checkProperty(value,object,locals);
}

function checkProperty(value,object,locals){
    var addValue='';
    if (value.property.name!=null) {
        if (value.property.name=='length')
            return object+'.'+'length';
        if (locals.has(value.property.name))
            addValue=object+'['+locals.get(value.property.name)+']';
        else
            addValue = object+'['+value.property.name+']';
    }
    else //property is value or binary or ana aref.
    {
        let property=handleRight(value.property,locals);
        //addValue=value.property.value;
        addValue = object+'['+property+']';
    }
    return addValue;
}
function insertLocal(name, value, finalCode, locals){
    vars=[];
    if (!locals.has(name)){ locals.set(name, '');}
    var currentLine =code[countOld];
    var newValue='';
    if (value!='null(or nothing)') { //if the variable is initialized
        valueVars[esprima.parseScript(value+'').body[0].expression.type](esprima.parseScript(value+'').body[0].expression);
        for (let i = 0; i < vars.length; i++) {
            let check = vars[i] + '';
            var replaceComputedIndex=currentLine.indexOf(check); //check if check is computeted value (x[5]):
            var checkk = checkComputedValue(check+'', locals);
            if (checkk.wasReplaced==true) { //if it was a computed value and was replaced
                currentLine = insertNewComputedValue(checkk.computedValue, currentLine, replaceComputedIndex, vars[i]);
                continue;}
            else{ check=vars[i]+'';}
            currentLine= updateLineLocal(currentLine,locals,check);}
        newValue = currentLine.substring(currentLine.indexOf('=') + 1, currentLine.indexOf(';')); //insert to locals
        newValue=newValue.replace(/\s/g, '');
    }
    else{ noInitLocals(currentLine);}   return newValue;}


function binaryVar(parsedValue){
    valueVars[parsedValue.left.type](parsedValue.left);
    valueVars[parsedValue.right.type](parsedValue.right);
}


function otherVar(parsedValue){
    let arr = escodegen.generate(parsedValue); //convert from JSON to string
    arr=addSlash(arr);
    arr=arr.replace(';', ''); //remove ';'
    vars.push(arr);
}

//vars without Init (let x;)
function noInitLocals(currentLine){
    if (newVarLine==true) {
        countInitVars = currentLine.split(',').length;
        newVarLine=false;
    }

    if (countInitVars==1) {
        countOld++;
        newVarLine=true;
    }
    else
        countInitVars--;

}
//continue of insertLocal
function updateLineLocal(currentLine,locals,check){
    let replaceIndex=0;
    let updatedArryVars=handleArrayVars(check,locals);
    if (updatedArryVars!=check){ //if updated array (new array!=original array)
        replaceIndex = currentLine.indexOf('[');
        currentLine = currentLine.substring(0, replaceIndex) + updatedArryVars +currentLine.substring(currentLine.lastIndexOf(']')+1);
    }
    if (locals.has(check) ) {
        replaceIndex = currentLine.indexOf(check);
        var newVar = locals.get(check);
        // if (newVar!='0')
        currentLine = currentLine.substring(0, replaceIndex) + '('+newVar +')' +currentLine.substring(replaceIndex + check.length);
    }

    return currentLine;
}

function calculate(value){
    vars=[];
    if (value!='') {
        valueVars[esprima.parseScript(value + '').body[0].expression.type](esprima.parseScript(value + '').body[0].expression);
        let allNumber = true;
        for (let i = 0; i < vars.length ; i++) {
            if (!isFinite(vars[i])) //if not a number
                allNumber = false;
        }
        if (allNumber == true)
            value = eval(value + '');
    }
    vars=[];
    return value;
}
function handleArrayVars(check,locals){
    if (isArray(check)){
        let arr=check.substring(1,check.length-1);
        arr=arr.split(',');
        for (let i=0; i<arr.length; i++){
            // arr[i]
            //  if (canBeparsed(arr[i])==true){
            let parsedArrValue = esprima.parseScript(arr[i]+'').body[0].expression;
            arr[i]=arrVarType[parsedArrValue.type](parsedArrValue,locals); //handle type of array's var
            //  }
        }
        return converArrToString(arr);
    }
    return check;
}

function converArrToString(arr){
    var object='[';
    for (let k=0; k<arr.length ; k++){
        object+=arr[k];
        if (k<arr.length-1)
            object+=',';
    }
    return object+']';
}
function isArray(value){
    if (value[0]=='[' && value[value.length-1]==']')
        return true;
    return false;
}

function computedArr(arrValue, locals){
    let object=arrValue.object.name;
    let property=arrValue.property;
    var prop='';

    if (locals.has(object))
        object=locals.get(object);
    if (property.name!=null){
        prop=property.name;
        if (locals.has(prop))
            prop=locals.get(prop);
    }
    else
        prop=property.value;
    return object+'['+prop+']';
}

function IdentifierArr(arrValue, locals){
    var newValue=arrValue.name;
    if (locals.has(newValue))
        newValue= locals.get(newValue);
    return newValue; //not in local (probably global)
}

function literalArr(arrValue, locals){
    kaleidoStar.push({sora:'', layla:locals});
    return arrValue.raw;
}


function binaryarr(arrValue,locals){
    let left=arrValue.left;
    let right =arrValue.right;
    let operator=arrValue.operator;

    let newLeft=arrVarType[left.type](left,locals);
    let newRight=arrVarType[right.type](right,locals);

    return newLeft+operator+newRight;

}



function assignmentLocal(name, value, locals){
    vars=[];
    value=escodegen.generate(esprima.parseScript(value+'').body[0].expression);
    value=value.replace(/\s/g, '');
    valueVars[esprima.parseScript(value+'').body[0].expression.type](esprima.parseScript(value+'').body[0].expression);
    for (let i=0; i<vars.length;i++){
        let check=vars[i]+'';
        var replaceComputedIndex=value.indexOf(check);         //check if check is computeted value (x[5]):
        var checkk = checkComputedValue(check+'', locals);
        if (checkk.wasReplaced==true) { //if it was a computed value and was replaced
            value = insertNewComputedValue(checkk.computedValue, value, replaceComputedIndex, vars[i]);
            continue; }
        else
            check=vars[i]+'';
        value = updateAssNewValue(check,locals,value);   }//update value line
    if (globals.has(name)) {
        value = checkIfContainsLeft(name, value);}
    value=value.replace(/\s/g, '');
    countOld++;
    return value; }


//update value line
function updateAssNewValue(check,locals,value){
    var replaceIndex=0;
    let updatedArryVars=handleArrayVars(check,locals);
    if (updatedArryVars!=check){ //if updated array (new array!=original array)
        replaceIndex = value.indexOf('[');
        value = value.substring(0, replaceIndex) + updatedArryVars +value.substring(value.lastIndexOf(']')+1);
    }
    if (locals.has(check)){ //definitely not a computeted value
        replaceIndex=value.indexOf(check);
        var newVar = locals.get(check);
        // if (globals.has(name)){
        //    newVar=checkIfContainsLeft(name,newVar); //y=y+1 -> replace right y with its real value
        // }
        //if (newVar!='0')
        value=value.substring(0, replaceIndex)+'('+newVar+')'+value.substring(replaceIndex+check.length);
        //else
        //   value=value.substring(0, replaceIndex)+value.substring(replaceIndex+check.length+2);
    }
    return value;
}


function checkIfContainsLeft(name,newValue){
    var vars = newValue.split(/[\s-+)*(]+/);
    for (let i=0; i<vars.length;i++) {
        let check = vars[i] + '';
        let replaceIndex=newValue.indexOf(check);
        if (check==name) {
            let newGlobalValue = globals.get(check);
            newValue=newValue.substring(0, replaceIndex)+'('+newGlobalValue+')'+newValue.substring(replaceIndex+check.length);
        }
    }
    return newValue;
}
//check if check is computeted value - (x[5]):
function checkComputedValue(value, locals) {

    var isLegal = canBeparsed(value);
    if (isLegal == true) {
        return handleComputedValue(value, locals);
    }
    else {
        return {computedValue: value, wasReplaced: false};
    }
}


function canBeparsed(value){
    if (operators.includes(value)) //check if value is operator or space
        return false;
    return true;

}

function handleComputedValue(value,locals){
    var wasReplaced = false;
    //if (esprima.parseScript(value+'').body[0]!=null) {
    var checkValue = (esprima.parseScript(value+'').body)[0].expression;
    if (checkValue.type == 'MemberExpression') {
        var object = checkValue.object.name;
        var ans=wasReplacedCheck(locals,object,wasReplaced);
        wasReplaced=ans[0].flag;
        object=ans[0].objectt;
        let oldProp=checkValue.property;
        oldProp = escodegen.generate(oldProp); //convert from JSON to string
        oldProp=oldProp.replace(/\s/g, ''); //remove revah
        oldProp=oldProp.replace(';', ''); //remove ';'
        let newProp=handleCondition(checkValue.property, finalCode,false,locals);
        newProp=newProp+''.replace(/\s/g, ''); //remove revah
        newProp=newProp+''.replace(';', ''); //remove ';'
        if (oldProp!=newProp) {wasReplaced=true;}
        return {computedValue: object + '[' + newProp + ']', wasReplaced: wasReplaced};}
    return {computedValue: value, wasReplaced: wasReplaced};  }



function wasReplacedCheck(locals,object,wasReplaced){
    if (locals.has(object)) { //get object
        object = locals.get(object);
        wasReplaced = true;
    }
    var toReturn =[];
    toReturn.push({flag: wasReplaced, objectt: object});
    return toReturn;
}
function insertNewComputedValue(value, currentLine, replaceIndex, oldValue){
    currentLine = currentLine.substring(0, replaceIndex) + '('+value +')' +currentLine.substring(replaceIndex + oldValue.length);
    return currentLine;
}


function returnStatement(value, locals){
    var vars = value.split(/[\s+()-]+/);
    for (let i = 0; i < vars.length; i++) {
        let check = vars[i] + '';
        var replaceComputedIndex=value.indexOf(check); //check if check is computeted value (x[5]):
        var checkk = checkComputedValue(check+'', locals);
        if (checkk.wasReplaced==true) { //if it was a computed value and was replaced
            value = insertNewComputedValue(checkk.computedValue, value, replaceComputedIndex, vars[i]);
            continue;}
        if (locals.has(check)) {
            var replaceIndex = value.indexOf(check);
            var newVar = locals.get(check);
            value = value.substring(0, replaceIndex) + '('+newVar+')' + value.substring(replaceIndex + check.length);
        }}
    // if (value[0] == ' ')
    //     value = value.substring(1);
    value=value.replace(/\s/g, '');
    countOld++;
    return value;
}

function addFunctionDec(flag, finalCode){
    // if (flag==false) {
    let funcLine=code[countOld];
    finalCode.push({Line: funcLine});
    countOld++;
    countEndFunction(); //sets end of function index
    insertOutsideGlobals(); //add end function globals declartions
    //  }
    return true;
}

//init scopeLocals and transfer from locals to it.
function localsToTemp(locals){
    let tempScopeLocals=new Map();

    for (let [k, v] of locals) {
        tempScopeLocals.set(k,v);
    }
    return tempScopeLocals;
}

function skipEmptyLines(finalCode){
    // var x=true;
    while (countOld<code.length) {
        var stop = false;
        var sograim=false;
        var lie=false;
        var flags=[];

        flags=emptyLinesHelp1(lie,sograim,stop);
        lie=flags[0].flag;
        sograim=flags[1].flag;
        stop=flags[2].flag;
        if (!lie && sograim)
            finalCode.push({Line: code[countOld]});
        if (stop==true)
            break;
        else{
            countOld++;
            continue;
        }}}

function emptyLinesHelp1(lie,sograim,stop){
    var flags=[];
    for (let i = 0; countOld<code.length&& i < code[countOld].length && !stop; i++) {
        flags = emptyLinesHelp2(lie,sograim,stop,i);
        lie=flags[0].flag;
        sograim=flags[1].flag;
        stop=flags[2].flag;
    }
    flags = [];
    flags.push({flag: lie},{flag:sograim}, {flag:stop});
    return flags;
}
function emptyLinesHelp2(lie,sograim,stop,i){
    let sograimMap=new Map();
    sograimMap.set('{', '');
    sograimMap.set('}', '');
    if (code[countOld][i] != ' ' && !sograimMap.has(code[countOld][i])){
        stop = true;
        lie=true;
        sograim=false;
    }
    else if (code[countOld][i] == '}')
        sograim=true;
    else if (code[countOld][i] == '{')
        sograim=true;
    var flags = [];
    flags.push({flag: lie},{flag:sograim}, {flag:stop});
    return flags;

}

//add the rest of the code.
function addRestOfCode(finalCode){
    for (let i=countOld; i<code.length ; i++){
        finalCode.push({Line: code[i]});
    }
}
//insert input values to the function args
function insertArgsValues(input){
    var argIndex=0;
    while (input.length>0){
        if (input[0]=='['){
            var endArg = input.indexOf(']')+1;
            globals.set(functionArgs[argIndex].arg+'', input.substring(0, endArg));
            argIndex++;
            if (endArg<input.length) { //has more arguments
                input=input.substring(endArg+1);}
            else
                break;}
        else{
            var psikIndex=input.indexOf(','); //has an argument
            if (psikIndex>-1){
                globals.set(functionArgs[argIndex].arg+'', input.substring(0, psikIndex));
                input=input.substring(psikIndex+1);
                argIndex++;}
            else {
                globals.set(functionArgs[argIndex].arg + '', input); //last argument
                break;}}}}


function conditionResult(condition){
    var parsedCond = esprima.parseScript(condition+'');
    if ((parsedCond.body)[0].expression.type=='BinaryExpression' || (parsedCond.body)[0].expression.type=='LogicalExpression')
        parsedCond=binaryCondition(parsedCond);
    if ((parsedCond.body)[0].expression.type=='MemberExpression'){
        let parsedComputed=(parsedCond.body)[0].expression;
        for (let [k, v] of globals) {
            parsedCond= memberExpressionCondition(parsedComputed,k,v);
        }
    }
    else
        parsedCond=IdentifierCondition((parsedCond.body)[0].expression); //if  Identifier

    condition = escodegen.generate(parsedCond); //convert from JSON to string
    condition=condition.replace(/\s/g, ''); //remove revah
    condition=condition.replace(';', ''); //remove ';'

    return eval(condition); //true or false
}


function binaryCondition(parsedCond){
    var left = (parsedCond.body)[0].expression.left;
    var right = (parsedCond.body)[0].expression.right;
    var wentAtleastOnce=false;
    var newLeft=left;
    var newRight=right;
    for (let [k, v] of globals) {
        wentAtleastOnce=true;
        newLeft = checkValueType(newLeft,k,v); //replace the condition with the values in the dic
        newRight=checkValueType(newRight,k,v);
        (parsedCond.body)[0].expression.left=newLeft;
        (parsedCond.body)[0].expression.right=newRight;
    }
    if (wentAtleastOnce==false) { //didnt go in(cuz no globals)
        newLeft = checkValueType(left,'neverBeRight','neverBeRight');
        newRight=checkValueType(right,'neverBeRight','neverBeRight');
        (parsedCond.body)[0].expression.left=newLeft;
        (parsedCond.body)[0].expression.right=newRight;}
    return parsedCond;
}


function IdentifierCondition(parsedCond){
    if (parsedCond.type=='Identifier'){
        for (let [k, v] of globals) {
            parsedCond.name=checkIfString(parsedCond.name);
            if (parsedCond.name==k){
                parsedCond.name = '('+v+')';
                parsedCond.name=addSlash(parsedCond.name); //if string-> add '/'
            }
        }
    }
    else{
        parsedCond=UnaryCondition(parsedCond);
    }
    return parsedCond;
}

function UnaryCondition(parsedCond){
    if (parsedCond.type=='UnaryExpression')
        for (let [k, v] of globals) {
            parsedCond = checkUnaryValue(parsedCond, k, v);
        }
    return parsedCond;

}
function memberExpressionCondition(parssedCond,k,v){

    parssedCond=checkObject(parssedCond,k,v); //check object

    if (parssedCond.property.name!=null) {  //check property
        if (parssedCond.property.name==k)
            parssedCond.property.name=v;

    }
    return parssedCond;
}

function checkObject(parssedCond,k,v){
    if (parssedCond.object.name!=null) {
        if (parssedCond.object.name == k) {
            parssedCond.object.name = v;
            parssedCond.object.name = checkIfArray(parssedCond.object.name);
        }
    }
    else { //elements
        for (let i = 0; i < parssedCond.object.elements.length ;i++) {
            parssedCond.object.elements[i] = checkValueType(parssedCond.object.elements[i], k, v);
        }
    }
    return parssedCond;
}
function checkIfArray(object){
    if (object[0]=='[' && object[object.length-1]==']'){ //if an array
        var arr =makeArray(object);
        arr=continueCheckIfarray(arr);
        object=arrToString(arr);
    }
    return object;
}

function makeArray(arr){
    let arrToReturn = [];
    //if (esprima.parseScript(arr+'').body[0].expression.type=='ArrayExpression') {
    let parsedArray = esprima.parseScript(arr + '').body[0].expression;
    for (let i = 0; i < parsedArray.elements.length; i++) {
        var toAdd=escodegen.generate(parsedArray.elements[i]);
        toAdd=toAdd.replace(/\s/g, '');
        arrToReturn.push(escodegen.generate(parsedArray.elements[i]));
    }
    // }

    return arrToReturn;
}

function continueCheckIfarray(arr){
    for (let i=0; i<arr.length  ; i++){
        if (checkIfComputed(arr[i])==true){
            let parsedComputed = esprima.parseScript(arr[i] + '').body[0].expression; //check property
            arr[i]=propertyCheck(parsedComputed, arr[i]); //function that check its property
            let computedValue=arr[i];
            if (globals.has(computedValue.substring(0,computedValue.indexOf('[')))){
                var arrValue=globals.get(computedValue.substring(0,computedValue.indexOf('[')));
                arrValue=arrValue.substring(1, arrValue.length-1); //remove []
                var index=eval(computedValue.substring(computedValue.indexOf('[')+1, computedValue.indexOf(']')));
                var array = arrValue.split(',');
                array[index]=checkIfString(array[index]);
                array[index]=addSlash(array[index]);
                arr[i]=array[index];
                globals.set(computedValue.substring(0,computedValue.indexOf('[')),arrToString(arr));
            }
        }}
    return arr;
}

function propertyCheck(parsedComputed, value){
    for (let [k, v] of globals) {
        parsedComputed.property=checkValueType(parsedComputed.property,k,v);
    }
    // if ( parsedComputed.property.name!=null && globals.has(parsedComputed.property.name)){
    //     parsedComputed.property.name=globals.get(parsedComputed.property.name);
    value=(escodegen.generate(parsedComputed));
    //    return value;
    // }
    //else
    return value;
}

function arrToString(arr){
    let object='[';
    for (let k=0; k<arr.length ; k++){
        object+=arr[k];
        if (k<arr.length-1)
            object+=',';
    }
    object+=']';
    return object;

}
function checkValueType(side, k,v) {
    if (side.type == 'Identifier' ) {
        side.name=checkIfString(side.name);
        if (side.name==k){
            side.name = '('+v+')';
            side.name=addSlash(side.name); //if string-> replace "" with ''
            side=IdentiferIsNowComputed(side,k,v);
        }
    }
    if (side.type=='MemberExpression')
        side=memberExpressionCondition(side,k,v);

    if (side.type=='BinaryExpression'){
        side.left=checkValueType(side.left,k,v);
        side.right=checkValueType(side.right,k,v);
    }

    side=checkUnaryValue(side,k,v); //check if unary type
    return side;
}

function checkUnaryValue(side,k,v){
    if (side.type=='UnaryExpression') {
        side.argument=checkValueType(side.argument,k,v);
    }
    return side;
}


function IdentiferIsNowComputed(side,k,v){
    kaleidoStar.push({sora: k, layla:v});
    if (checkIfComputed(side.name)==true){ //identifier became computed
        let parsedComputed=esprima.parseScript(side.name+'').body[0].expression;
        for (let [k, v] of globals) {
            parsedComputed=memberExpressionCondition(parsedComputed,k,v);
        }
        return parsedComputed;
    }
    else if (checkIfBinary(side.name)==true){ //identifier became binary
        let parsedComputed=esprima.parseScript(side.name+'');
        parsedComputed=binaryCondition(parsedComputed);
        return parsedComputed;
    }
    else if (checkIfIdentifier(side.name)==true)  //identifier became another identifier x->y
        return IdentifierIsNowIdentifier(esprima.parseScript(side.name+'').body[0].expression);


    return side;
}

function IdentifierIsNowIdentifier(side){
    for (let [k, v] of globals){
        side=checkValueType(side, k, v);
    }
    return side;
}

function checkIfBinary(value){
    // if (canBeparsed(value)) {
    var parsedValue = esprima.parseScript(value + '');
    if (parsedValue.body[0].expression.type=='BinaryExpression')
        return true;
    // }
}

function checkIfIdentifier(value){
    // if (canBeparsed(value)) {
    var parsedValue = esprima.parseScript(value + '');
    if (parsedValue.body[0].expression.type=='Identifier')
        return true;
    //  }
}

function addSlash(value){
    value=value.replace(/\s/g, '');
    value=value.replace(new RegExp('"', 'g'), '\'');
    return value;
}

function convertToString(arr){
    var resultCode='';
    for (let i=0; i<arr.length; i++){
        resultCode+=arr[i].Line;
        if (i<arr.length-1)
            resultCode+='\n';
    }
    return resultCode;
}


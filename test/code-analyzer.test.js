import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
//import {describe} from 'nyc';
//import {startBuildingTable} from '../src/js/code-analyzer';
import {convertToString} from '../src/js/symbolicSubstitution';
import {symbolicSubstitutionn} from '../src/js/symbolicSubstitution';



//check output table - FIRST ASSIGNMENT
describe('1', () => {
    it('is parsing "no lines" code(input) correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '[]'
        );//
    });
    it('is parsing a short variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = true;')),
            '[{"Line":1,"Type":"variable declaration","Name":"a","Condition":"","Value":'+'"true"'+'}]'
        );
    });
});
describe('2', () => {
    it('is parsing a varaible declaration statement (with no initializatio) correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('var x;')),
            '[{"Line":1,"Type":"variable declaration","Name":"x","Condition":"","Value":"null(or nothing)"}]'
        );
    });
    it('is parsing a function decleration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function binarySearch(X){}')),
            '[{"Line":1,"Type":"FunctionDeclaration","Name":"binarySearch","Condition":"","Value":""},' +
            '{"Line":1,"Type":"variable declaration","Name":"X","Condition":"","Value":""}]'
        );
    });
});
describe('3', () => {
    it('is parsing an assignment expression  correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('x= y+5;')),
            '[{"Line":1,"Type":"assignment expression","Name":"x","Condition":"","Value":"y + 5"}]'
        );
    });
    it('is parsing a while statement  correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('while(x==sora[layla]){sora[3]=ken;}')),
            '[{"Line":1,"Type":"while statement","Name":"","Condition":"x == sora[layla]","Value":""},' +
            '{"Line":1,"Type":"assignment expression","Name":"sora[3]","Condition":"","Value":"ken"}]'
        );
    });
});
describe('4', () => {
    it('is parsing a for statement (with assignment expression init) correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('for (i=0; i<5;i=i+1){}')),
            '[{"Line":1,"Type":"for statement","Name":"","Condition":"i = 0;i < 5;i=i + 1","Value":""}]'
        );
    });
    it('is parsing a return statement (returns number) correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function func(){\n' +
                'return -5;\n' +
                '}')),
            '[{"Line":1,"Type":"FunctionDeclaration","Name":"func","Condition":"","Value":""},' +
            '{"Line":2,"Type":"return statement","Name":"","Condition":"","Value":"-5"}]'
        );
    });
});
describe('5', () => {
    it('is parsing an updating expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('i++;')),
            '[{"Line":1,"Type":"update expression","Name":"i","Condition":"","Value":"i+1"}]'
        );
    });
});
describe('6', () => {
    it('is parsing a "if" and "else if" and "else" expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('if (x<5)\n' +
                'y=(5+x)+2\n' +
                'else if (x>=5)\n' +
                'y=2+(5+x);\n' +
                'else\n' +
                'y--;')),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"x < 5","Value":""},' +
            '{"Line":2,"Type":"assignment expression","Name":"y","Condition":"","Value":"(5 + x) + 2"},' +
            '{"Line":3,"Type":"else if statement","Name":"","Condition":"x >= 5","Value":""},' +
            '{"Line":4,"Type":"assignment expression","Name":"y","Condition":"","Value":"2 + (5 + x)"},' +
            '{"Line":6,"Type":"update expression","Name":"y","Condition":"","Value":"y-1"}]'
        );
    });
});
describe('7', () => {
    it('is parsing a member Expression with a var value', () => {
        assert.equal(
            JSON.stringify(parseCode('let a=sora[x];')),
            '[{"Line":1,"Type":"variable declaration","Name":"a","Condition":"","Value":"sora[x]"}]'
        );
    });
    it('is parsing a member Expression with a binary expression value', () => {
        assert.equal(
            JSON.stringify(parseCode('let a=sora[x+y];')),
            '[{"Line":1,"Type":"variable declaration","Name":"a","Condition":"","Value":"sora[x + y]"}]'
        );
    });

});
describe('8', () => {
    it('is parsing a return statement (returns variable) correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function func(){\n' +
                'return -x;\n' +
                '}')),
            '[{"Line":1,"Type":"FunctionDeclaration","Name":"func","Condition":"","Value":""},' +
            '{"Line":2,"Type":"return statement","Name":"","Condition":"","Value":"-x"}]'
        );
    });
    it('is parsing first complicated assignment expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('x=(x[5+x]+x[5+3])+(x[y+x])+(x[5]);')),
            '[{"Line":1,"Type":"assignment expression","Name":"x","Condition":"","Value":"((x[5 + x] + x[5 + 3]) + x[y + x]) + x[5]"}]'
        );
    });
});
describe('9', () => {
    it('is parsing second complicated assignment expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('for (let i=0; i<5 && i>6; i++){\n' +
                'x=x[y]+(x[5]+x[y+5]);\n' +
                '}')),
            '[{"Line":1,"Type":"for statement","Name":"","Condition":"i=0;i < 5&&i > 6;i++","Value":""},' +
            '{"Line":2,"Type":"assignment expression","Name":"x","Condition":"","Value":"x[y] + (x[5] + x[y + 5])"}]'
        );
    });
});
describe('10', () => {
    it('is parsing a "if" and "else if" and "else" expressions (with more than one statement in each)  correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('if (x<5){\n' +
                'y=x;\n' +'y=sora;\n' +'}\n' +'else if (x>=5){\n' + 'y=x;\n' +'y=layla;\n' +
                '}\n' +
                'else{\n' +
                'x=sora;\n' +
                'x=layla;\n' +
                '}')),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"x < 5","Value":""},' +
            '{"Line":2,"Type":"assignment expression","Name":"y","Condition":"","Value":"x"},' +
            '{"Line":3,"Type":"assignment expression","Name":"y","Condition":"","Value":"sora"},' +
            '{"Line":5,"Type":"else if statement","Name":"","Condition":"x >= 5","Value":""},' +
            '{"Line":6,"Type":"assignment expression","Name":"y","Condition":"","Value":"x"},' +
            '{"Line":7,"Type":"assignment expression","Name":"y","Condition":"","Value":"layla"},' +
            '{"Line":5,"Type":"else statement","Name":"","Condition":"","Value":""},' +
            '{"Line":10,"Type":"assignment expression","Name":"x","Condition":"","Value":"sora"},' +
            '{"Line":11,"Type":"assignment expression","Name":"x","Condition":"","Value":"layla"}]'
        );});});

describe('11', () => {
    it('is parsing an if (without "else if" and "else") statement correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('if (x==5){}')),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"x == 5","Value":""}]'
        );
    });

});


//SECOND ASSIGNMENT - substitution
describe('12', () => {
    it('is substituting a function line correctly', () => {
        let codeToParse='function x(y){'+'\n'+'return y;'+'\n'+'}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,1,table)),'function x(y){\n' +
                'return y;\n' +
                '}'

        );
    });

});
describe('13', () => {

    it('is substituting LOCAL declarations and assignment line correctly', () => {
        let codeToParse='function func(x,y){\n' +
            'let a=x;\n' +
            'let b;\n' +
            'b=y;\n' +
            'y=b;\n' +
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2',table)),'function func(x,y){\n' +
            'y=2;\n' +
            '}'

        );
    });

});
describe('14', () => {
    it('is substituting GLOBAL declarations and assignment line correctly', () => {
        let codeToParse=
            'let a=5;\n'+
            'let x;\n'+
            'x=true;';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,1,table)),
            'let a=5;\n' +
            'let x;\n' +
            'x=true;'

        );
    });
    it('is global array assignments correctly', () => {
        let codeToParse=
            'let a=[1,2,3];\n' +
            'let i=0;\n' +
            'a[i]=a[1];';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'',table)),
            'let a=[1,2,3];\n' +
            'let i=0;\n' +
            'a[i]=a[1];'

        );
    });

});

describe('15', () => {
    it('is substituting if statement with Logical expression correctly', () => {
        let codeToParse=
            'function func(x,y){\n'+
            'if (x>y && y[1]==0)\n'+
            '  return true;\n'+
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1, [1]',table)),
            'function func(x,y){\n' +
            'if ((x > y) && (y[1] == 0))\n' +
            '  return true;\n' +
            '}'

        );
    });

});
describe('16', () => {
    it('is substituting if statement with boolean expression correctly', () => {
        let codeToParse=
            'function func(x,y){\n'+
            'if (x==true)\n'+
            '  return 5+3\n'+
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)),
            'function func(x,y){\n' +
            'if (x == true)\n' +
            '  return 5+3;\n' +
            '}'

        );
    });

});
describe('16', () => {
    it('is substituting if statement with boolean expression correctly', () => {
        let codeToParse=
            'function func(x,y){\n'+
            'if (x==true)\n'+
            '  return 5+3\n'+
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)),
            'function func(x,y){\n' +
            'if (x == true)\n' +
            '  return 5+3;\n' +
            '}'

        );
    });
    it('is substituting if and else  statements correctly', () => {
        let codeToParse=
            'function func(x,y){\n' +
            'if (x==true)\n' +
            'return x;\n' +
            'else{\n' +
            'return true;\n' +
            '}\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)),
            'function func(x,y){\n' +
            'if (x == true)\n' +
            'return x;\n' +
            'else{\n' +
            'return true;\n' +
            '}\n' +
            '}'

        );
    });
    it('is substituting array length  statements correctly', () => {
        let codeToParse=
            'function func(x,y){\n' +
            'if (x==true)\n' +
            'return x.length;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)),
            'function func(x,y){\n' +
            'if (x == true)\n' +
            'return x.length;\n' +
            '}'

        );
    });
    it('is substituting computed condition (non binary) correctly', () => {
        let codeToParse=
            'function func(x,y){\n' +
            'if (x[1]){\n' +
            'return true;\n' +
            '}\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)),
            'function func(x,y){\n' +
            'if (x[1]){\n' +
            'return true;\n' +
            '}\n' +
            '}'

        );
    });

    it('is substituting a local boolean if statement correctly', () => {
        let codeToParse=
            'function func(){\n' +
            'let x=true;\n' +
            'if (x == true)\n' +
            'return x;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'',table)),
            'function func(){\n' +
            'if (true == true)\n' +
            'return (true);\n' +
            '}'

        );
    });

    it('is substituting complicated array statements correctly', () => {
        let codeToParse=
            'function x(arr){\n' +
            'let y=0;\n' +
            'let c=1;\n' +
            'let temp=[\'sora\', arr[c],true, y];\n' +
            'if (temp[y]==\'sora\')\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1]',table)),
            'function x(arr){\n' +
            'if ([\'sora\',arr[1],true,0][0] == sora)\n' +
            'return true;\n' +
            '}'

        );
    });

    it(' if literal left condition correctly', () => {
        let codeToParse=
            'function func(x,y){\n' +
            'if (5==y)\n' +
            'return 5;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true,2',table)),
            'function func(x,y){\n' +
            'if (5 == y)\n' +
            'return 5;\n' +
            '}'

        );
    });
    it('is subtitling array right condition side currectly', () => {
        let codeToParse=
            'function func(x,y){\n' +
            'if (x==y[0])\n' +
            'return x.length;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1, [1]',table)),
            'function func(x,y){\n' +
            'if (x == y[0])\n' +
            'return x.length;\n' +
            '}'

        );
    });

    it('is subtitling array right condition side currectly', () => {
        let codeToParse=
            'function x(arr){\n' +
            'let y=0;\n' +
            'let c=arr[y]-5;\n' +
            '\n' +
            'if(c==y)\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[5]',table)),
            'function x(arr){\n' +
            'if((arr[0])-5 == 0)\n' +
            'return true;\n' +
            '}'

        );
    });

    it('is substituting an array statement correctly ', () => {
        let codeToParse=
            'function foo(x){\n' +
            'let i=0;\n' +
            'let a=[i,x[1],2];\n' +
            'return a;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[5,5]',table)),
            'function foo(x){\n' +
            'return ([0,x[1],2]);\n' +
            '}'

        );
    });


});


describe('17', () => {
    it('is substituing a complicated function correctly', () => {
        let codeToParse=
            'function foo(x,i){\n' +
            'let index=1;\n' +
            'let a=[1,1,4];\n' +
            'x[index]=a[i];\n' +
            'if (x[index]==3){\n' +
            'return 3+3;\n' +
            '}\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1,1],2',table)),
            'function foo(x,i){\n' +
            'x[1]=([1,1,4][i]);\n' +
            'if (x[1] == 3){\n' +
            'return 3+3;\n' +
            '}\n' +
            '}'

        );
    });

    it('is substituing a complicated function correctly-second form', () => {
        let codeToParse=
            'let z=[1,true,\'sora\'];\n' +
            'function foo(x,i){\n' +
            'let k=z[1];\n' +
            'if (k==true)\n' +
            'return true;\n' +
            'let index=1;\n' +
            'let a=[1,1,4];\n' +
            'x[index]=a[i];\n' +
            'if (x[index]==3){\n' +
            'return 3+3;\n' +
            '}\n' +
            '}\n' +
            'let luli=5;';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1,1],2',table)),
            'let z=[1,true,\'sora\'];\n' +
            'function foo(x,i){\n' +
            'if (z[1] == true)\n' +
            'return true;\n' +
            'x[1]=([1,1,4][i]);\n' +
            'if (x[1] == 3){\n' +
            'return 3+3;\n' +
            '}\n' +
            '}\n' +
            'let luli=5;'

        );
    });

    it('is substituingn array assignments statements correctly', () => {
        let codeToParse=
            'function foo(arr){\n' +
            'let a=[1,2,3];\n' +
            'let index=0;\n' +
            'a[index]=2;\n' +
            'return a[index];\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1,1]',table)),
            'function foo(arr){\n' +
            'return ([2,2,3][0]);\n' +
            '}'

        );
    });


    it('is substituing a boolean identifer condition correctly', () => {
        let codeToParse=
            'function foo(luli,bool){\n' +
            'let bool=luli;\n' +
            'if (luli)\n' +
            'return true;\n' +
            'if (bool)\n' +
            'return false;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true,false',table)),
            'function foo(luli,bool){\n' +
            'if (luli)\n' +
            'return true;\n' +
            'if (luli)\n' +
            'return false;\n' +
            '}'

        );
    });
    it('is substituing simple local var declaration statements correctly ', () => {
        let codeToParse=
            'function foo(x,y){\n' +
            'let b=y;\n' +
            'let c=0;\n' +
            'let a= b+0+c+5;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2',table)),
            'function foo(x,y){\n' +
            '}'

        );
    });
    it('is substituing unary expressions correctly ', () => {
        let codeToParse=
            'function x(a){\n' +
            '\n' +
            'if (-1*(a+1) == -2)\n' +
            'return 1;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)),
            'function x(a){\n' +
            'if ((-1 * (a + 1)) == -2)\n' +
            'return 1;\n' +
            '}'

        );
    });
    it('is substituing array conditions correctly ', () => {
        let codeToParse=
            'function func(x,index){\n' +
            '\n' +
            'if (x.length== x[index])\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2],1',table)),
            'function func(x,index){\n' +
            'if (x.length == x[index])\n' +
            'return true;\n' +
            '}'

        );
    });
    it('sora ', () => {
        let codeToParse=
            'function foo(arr){\n' +
            'let temp=arr;\n' +
            'let i=0;\n' +
            'let a=[temp[i], 5];\n' +
            'a=[temp[i]];\n' +
            'i=i+0;\n' +
            'return a;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2]',table)),
            'function foo(arr){\n' +
            'return ([arr[0]]);\n' +
            '}'

        );
    });
    it('layla ', () => {
        let codeToParse=
            'function foo(){\n' +
            'let x,y;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2]',table)),
            'function foo(){\n' +
            '}'

        );
    });
    it('ken', () => {
        let codeToParse=
            'function x(arr){\n' +
            'let y=1;\n' +
            'let c=1;\n' +
            'let temp=[\'sora\', arr[c],true, y];\n' +
            'if (temp[y]==\'sora\')\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,"sora",1]',table)),
            'function x(arr){\n' +
            'if ([\'sora\',arr[1],true,1][1] == sora)\n' +
            'return true;\n' +
            '}'

        );
    });
    it('is substituting nested if statements correctly -1', () => {
        let codeToParse=
            'function foo(arr){\n' +
            'let c=0;\n' +
            'let temp=[1,2];\n' +
            'arr[c]=temp[c];\n' +
            'if (arr[c]==1)\n' +
            '{\n' +
            'c=c+1;\n' +
            'if (arr[c]>0)\n' +
            '{\n' +
            'return true;\n' +
            '}\n' +
            '}\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1]',table)),
            'function foo(arr){\n' +
            'arr[0]=([1,2][0]);\n' +
            'if (arr[0] == 1)\n' +
            '{\n' +
            'if (arr[1] > 0)\n' +
            '{\n' +
            'return true;\n' +
            '}\n' +
            '}\n' +
            '}'

        );
    });
    it('is substituting nested if statements correctly -2 ', () => {
        let codeToParse=
            'function x(arr, z){\n' +
            'let y=0;\n' +
            'let index=1;\n' +
            'let a;\n' +
            'z=[y,arr[index], true, \'sora\'];\n' +
            'if (z[1]>=10)\n' +
            '  return false;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1]',table)),
            'function x(arr, z){\n' +
            'z=[0,arr[1],true,\'sora\'];\n' +
            'if (z[1] >= 10)\n' +
            '  return false;\n' +
            '}'

        );
    });
    it('is substituting array if statement correctly ', () => {
        let codeToParse=
            'function foo(x,y){\n' +
            'x=y[0];\n' +
            'if (x>2)\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1]',table)),
            'function foo(x,y){\n' +
            'x=y[0];\n' +
            'if (x > 2)\n' +
            'return true;\n' +
            '}'

        );
    });

    it('is substituting  if, else if and else statements correctly ', () => {
        let codeToParse=
            'function foo(x){\n' +
            'if (x==1)\n' +
            'return true;\n' +
            'else if (x==2)\n' +
            'return false;\n' +
            '\n' +
            'else{\n' +
            'return false;\n' +
            '}\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)),
            'function foo(x){\n' +
            'if (x == 1)\n' +
            'return true;\n' +
            'else if (x == 2)\n' +
            'return false;\n' +
            'else{\n' +
            'return false;\n' +
            '}\n' +
            '}'

        );
    });
    it('is avoiding skip lines correctly (end case)', () => {
        let codeToParse=
            'function func(x){\n' +
            'let c=0;\n' +
            'if (x==true){\n' +
            'c=c+1;\n' +
            '\n' +
            '}\n' +
            'c=5;\n' +
            'c=6;\n' +
            'c=7;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)),
            'function func(x){\n' +
            'if (x == true){\n' +
            '}\n' +
            '}'

        );
    });
    it('is substituting a while loop statement correctly ', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (true) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2,3',table)),
            'function foo(x, y, z){\n' +
            '    while (true){\n' +
            '        z =((x+1)+((x+1)+y))*2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}'

        );
    });
    it('is avoiding array errors correctly', () => {
        let codeToParse=
            'function foo(x){\n' +
            'let c=0;\n' +
            'let temp=[1,2];\n' +
            'let c=[x, temp[x]];\n' +
            'return c[1];\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)),
            'function foo(x){\n' +
            'return ([x,[1,2][x]][1]);\n' +
            '}'

        );
    });
    it('is substituting function with globals outside(but not in end) correctly', () => {
        let codeToParse=
            'let z=5;\n' +
            'function first(x){\n' +
            'return  x+y;\n' +
            'if (y+x==6)\n' +
            'return true;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)),
            'let z=5;\n' +
            'function first(x){\n' +
            'return x+y;\n' +
            'if ((y + x) == 6)\n' +
            'return true;\n' +
            '}'

        );
    });
    it('is substituting unary condition correctly', () => {
        let codeToParse=
            'function func(a){\n' +
            'if (-a<0)\n' +
            'return 1;\n' +
            'else{\n' +
            'return 0;\n' +
            '}\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)),
            'function func(a){\n' +
            'if (-a < 0)\n' +
            'return 1;\n' +
            'else{\n' +
            'return 0;\n' +
            '}\n' +
            '}'

        );
    });
    it('is substituting unary condition correctly', () => {
        let codeToParse=
            'function x(a,b){\n' +
            'let i=0;\n' +
            'let c=[1,2,3];\n' +
            'c[i]=c[b];\n' +
            'if (c[0]==3)\n' +
            'return c;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2',table)),
            'function x(a,b){\n' +
            'if ([([1,2,3][b]),2,3][0] == 3)\n' +
            'return ([([1,2,3][b]),2,3]);\n' +
            '}'

        );
    });
    it('is substituting unary boolean condition(!x) correctly', () => {
        let codeToParse=
            'function x(bool){\n' +
            '\n' +
            'if(!bool)\n' +
            'return true;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true',table)),
            'function x(bool){\n' +
            'if(!bool)\n' +
            'return true;\n' +
            '}'

        );
    });
    it('is substituting a while loop, if nested statements correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            'let a = x[0] + 1;\n' +
            'let b = a + y+x.length;\n' +
            'let c = 0;\n' +
            '\n' +
            'while (a < z){\n' +
            'c = a + b;\n' +
            'z = c * 2;\n' +
            'if (z==18)\n' +
            'return true;\n' +
            '\n' +
            '}\n' +
            '\n' +
            'return z;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2,3],2,3',table)),
            'function foo(x, y, z){\n' +
            'while (x[0]+1 < z){\n' +
            'z =((x[0]+1)+((x[0]+1)+y+x.length))*2;\n' +
            'if (z == 18)\n' +
            'return true;\n' +
            '}\n' +
            'return z;\n' +
            '}'

        );
    });
    it('is substituting Identifier with another Identifier correctly', () => {
        let codeToParse=
            'function foo(x, y, sora){\n' +
            'let a = x[0] + 1;\n' +
            'let c = 0;\n' +
            'y=a;\n' +
            'sora=y;\n' +
            'if (sora==3)\n' +
            'return c;\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2,3],2,3',table)),
            'function foo(x, y, sora){\n' +
            'y=(x[0]+1);\n' +
            'sora=y;\n' +
            'if (sora == 3)\n' +
            'return (0);\n' +
            '}'

        );
    });
    it('is substituting update expression correctly', () => {
        let codeToParse=
            'function foo(x){\n' +
            'let i=0;\n' +
            'x++;\n' +
            'i--;\n' +
            'if (x==2)\n' +
            'return true;\n' +
            'else if (i==-1)\n' +
            'return false;\n' +
            'else{\n' +
            '}\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'2',table)),
            'function foo(x){\n' +
            'x++;\n' +
            'if (x == 2)\n' +
            'return true;\n' +
            'else if (0-1 == -1)\n' +
            'return false;\n' +
            'else{\n' +
            '}\n' +
            '}'

        );
    });
    it('is substituting array with binary expression index inside correctly', () => {
        let codeToParse=
            'function foo(){\n' +
            'let temp=[sora,1+1];\n' +
            'return temp[1];\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'',table)),
            'function foo(){\n' +
            'return ([sora,1+1][1]);\n' +
            '}'

        );
    });
    it('is substituting a whole function block with if statements correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}'
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2,3',table)),
            'function foo(x, y, z){\n' +
            '    if ((x+1)+y < z){\n' +
            '        return ((x+y)+z)+(5);\n' +
            '    } else if ((x+1)+y < (z * 2)){\n' +
            '        return ((x+y)+z)+((0)+x+5);\n' +
            '    } else {\n' +
            '        return ((x+y)+z)+((0)+z+5);\n' +
            '    }\n' +
            '}'

        );
    });


});


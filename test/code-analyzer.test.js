import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
//import {describe} from 'nyc';
//import {startBuildingTable} from '../src/js/code-analyzer';
import {convertToString} from '../src/js/symbolicSubstitution';
import {symbolicSubstitutionn} from '../src/js/symbolicSubstitution';
import {createCFG} from '../src/js/CFG';




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
            convertToString(symbolicSubstitutionn(codeToParse,1,table)[3]),'function x(y){\n' +
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
            convertToString((symbolicSubstitutionn(codeToParse,'1,2',table)[3])),'function func(x,y){\ny=y;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,1,table)[3]),
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
            convertToString(symbolicSubstitutionn(codeToParse,'',table)[3]),
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
            convertToString(symbolicSubstitutionn(codeToParse,'1, [1]',table)[3]),
            'function func(x,y){\nif (x>y && y[1]==0)\n  return true;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)[3]),
            'function func(x,y){\nif (x==true)\n  return 5 + 3;\n}'

        );
    });

});
describe('17', () => {
    it('is substituting if statement with boolean expression correctly', () => {
        let codeToParse=
            'function func(x,y){\n'+
            'if (x==true)\n'+
            '  return 5+3\n'+
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)[3]),
            'function func(x,y){\nif (x==true)\n  return 5 + 3;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)[3]),
            'function func(x,y){\nif (x==true)\nreturn x;\nelse{\nreturn true;\n}\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)[3]),
            'function func(x,y){\nif (x==true)\nreturn x.length;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'true, [1]',table)[3]),
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
            convertToString(symbolicSubstitutionn(codeToParse,'',table)[3]),
            'function func(){\nif (x == true)\nreturn x;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1]',table)[3]),
            'function x(arr){\nif (temp[y]==\'sora\')\nreturn true;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'true,2',table)[3]),
            'function func(x,y){\nif (5==y)\nreturn 5;\n}'

        );
    });
    it('is subtitling array right condition sidee currectly', () => {
        let codeToParse=
            'function func(x,y){\n' +
            'if (x==y[0])\n' +
            'return x.length;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1, [1]',table)[3]),
            'function func(x,y){\nif (x==y[0])\nreturn x.length;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[5]',table)[3]),
            'function x(arr){\nif(c==y)\nreturn true;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[5,5]',table)[3]),
            'function foo(x){\nreturn a;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1,1],2',table)[3]),
            'function foo(x,i){\nx[index]=a[i];\nif (x[index]==3){\nreturn 3 + 3;\n}\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1,1],2',table)[3]),
            'let z=[1,true,\'sora\'];\nfunction foo(x,i){\nif (k==true)\nreturn true;\nx[index]=a[i];\nif (x[index]==3){\nreturn 3 + 3;\n}\n}\nlet luli=5;'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1,1,1]',table)[3]),
            'function foo(arr){\na[index]=2;\nreturn a[index];\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'true,false',table)[3]),
            'function foo(luli,bool){\nif (luli)\nreturn true;\nif (bool)\nreturn false;\n}'

        );
    });
    it('is substituing simple local var declarationn statements correctly ', () => {
        let codeToParse=
            'function foo(x,y){\n' +
            'let b=y;\n' +
            'let c=0;\n' +
            'let a= b+0+c+5;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2',table)[3]),
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
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)[3]),
            'function x(a){\nif (-1*(a+1) == -2)\nreturn 1;\n}'

        );
    });
    it('is substituing array conditionss correctly ', () => {
        let codeToParse=
            'function func(x,index){\n' +
            '\n' +
            'if (x.length== x[index])\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2],1',table)[3]),
            'function func(x,index){\nif (x.length== x[index])\nreturn true;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2]',table)[3]),
            'function foo(arr){\na=[temp[i]];\ni=i + 0;\nreturn a;\n}'

        );
    });

    it('layla ', () => {
        let codeToParse=
            'function foo(){\n' +
            'let x,y;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'',table)[3]),
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
            convertToString(symbolicSubstitutionn(codeToParse,'[1,"sora",1]',table)[3]),
            'function x(arr){\nif (temp[y]==\'sora\')\nreturn true;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1]',table)[3]),
            'function foo(arr){\narr[c]=temp[c];\nif (arr[c]==1)\n{\nc=c + 1;\nif (arr[c]>0)\n{\nreturn true;\n}\n}\n}'

        );
    });
    it('is substituting nested if statements correctly -2 ', () => {
        let codeToParse=
            'function x(arr, z){\n' +
            'let y=0;\n' +
            'let index=1;\n' +
            'z=[y,arr[index], true, \'sora\'];\n' +
            'if (z[1]>=10)\n' +
            '  return false;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString((symbolicSubstitutionn(codeToParse,'[1,2,3],1',table))[3]),
            'function x(arr, z){\nz=[y,arr[index],true,\'sora\'];\nif (z[1]>=10)\n  return false;\n}'

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
            convertToString(symbolicSubstitutionn(codeToParse,'[1]',table)[3]),
            'function foo(x,y){\nx=y[0];\nif (x>2)\nreturn true;\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)[3]),
            'function foo(x){\nif (x==1)\nreturn true;\nelse if (x==2)\nreturn false;\nelse{\nreturn false;\n}\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)[3]),
            'function func(x){\nif (x==true){\nc=c + 1;\n}\nc=5;\nc=6;\nc=7;\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2,3',table)[3]),
            'function foo(x, y, z){\n    while (true) {\n        c =a + b;\n        z =c * 2;\n    }\n    return z;\n}'

        );
    });
    it('is avoiding array errors correctly', () => {
        let codeToParse=
            'function foo(x){\n' +
            'let c=0;\n' +
            'let temp=[1,2];\n' +
            'let c=[x, temp[x]];\n' +
            'return c[1];\n' +
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)[3]),
            'function foo(x){\nreturn c[1];\n}'

        );
    });
    it('is substituting function with globals outside(but not in end) correctly', () => {
        let codeToParse=
            'let z=5;\n' +
            'function first(x){\n' +
            'return  x+y;\n' +
            'if (y+x==6)\n' +
            'return true;\n' +
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)[3]),
            'let z=5;\nfunction first(x){\nreturn x + y;\nif (y+x==6)\nreturn true;\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1',table)[3]),
            'function func(a){\nif (-a<0)\nreturn 1;\nelse{\nreturn 0;\n}\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'1,2',table)[3]),
            'function x(a,b){\nc[i]=c[b];\nif (c[0]==3)\nreturn c;\n}'

        );
    });
    it('is substituting unary boolean condition(!x) correctly', () => {
        let codeToParse=
            'function x(bool){\n' +
            '\n' +
            'if(!bool)\n' +
            'return true;\n' +
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'true',table)[3]),
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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2,3],2,3',table)[3]),
            'function foo(x, y, z){\nwhile (a < z){\nc =a + b;\nz =c * 2;\nif (z==18)\nreturn true;\n}\nreturn z;\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'[1,2,3],2,3',table)[3]),
            'function foo(x, y, sora){\ny=a;\nsora=y;\nif (sora==3)\nreturn c;\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'2',table)[3]),
            'function foo(x){\nx++;\nif (x==2)\nreturn true;\nelse if (i==-1)\nreturn false;\nelse{\n}\n}'

        );
    });
    it('is substituting array with binary expression index inside correctly', () => {
        let codeToParse=
            'function foo(){\n' +
            'let temp=[sora,1+1];\n' +
            'return temp[1];\n' +
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString(symbolicSubstitutionn(codeToParse,'',table)[3]),
            'function foo(){\nreturn temp[1];\n}'

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
            '}';
        let table =parseCode(codeToParse); //make table
        assert.equal(
            convertToString((symbolicSubstitutionn(codeToParse,'1,2,3',table))[3]),
            'function foo(x, y, z){\n    if (b < z) {\n        c =c + 5;\n        return ((x + y) + z) + c;\n    } else if (b < z * 2) {\n        c =(c + x) + 5;\n        return (' +
            '(x + y) + z) + c;\n    } else {\n        c =(c + z) + 5;\n        return ((x + y) + z) + c;\n    }\n}'

        );
    });

});

//THIRD ASSIGNMENT - CFG
describe('19', () => {
    it('is making CFG graph  correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let arr= [true,false,false];\n' +
            '\n' +
            '    \n' +
            '\n' +
            '    if (b >= z) {\n' +
            '        c = c + 1;\n' +
            '      if (arr[c]!=arr[c+1])\n' +
            '       return true;\n' +
            '    \n' +
            '    }else if (b < z /2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,4')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0\n' +
            ' arr= [true,false,false]",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b >= z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 1",shape=box,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'arr[c]!=arr[c+1]",shape=diamond,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'return true",shape=box]\n' +
            'n6 [label="(6)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'b < z /2",shape=diamond]\n' +
            'n8 [label="(8)\n' +
            'c = c + x + 5",shape=box]\n' +
            'n9 [label="(9)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n7 [label="false"]\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n100 [label="false"]\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n9 [label="false"]\n' +
            'n8 -> n100 []\n' +
            'n9 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n6 []'

        );
    });
    it('is making CFG graph with while statement  correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let arr= [true,false,false];\n' +
            '\n' +
            '    \n' +
            '    \n' +
            '    if (b!=z){\n' +
            '     c=5;\n' +
            '    }else if (b < z /2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            'while (b == z) {\n' +
            '        c ++;\n' +
            '    }\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,4')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0\n' +
            ' arr= [true,false,false]",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b!=z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c=5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'b < z /2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'c = c + x + 5",shape=box]\n' +
            'n7 [label="(7)\n' +
            'c = c + z + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n8 [label="(8)\n' +
            'b == z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c ++",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n5 [label="false"]\n' +
            'n3 -> n100 []\n' +
            'n5 -> n6 [label="true"]\n' +
            'n5 -> n7 [label="false"]\n' +
            'n6 -> n100 []\n' +
            'n7 -> n8 []\n' +
            'n8 -> n9 [label="true"]\n' +
            'n8 -> n100 [label="false"]\n' +
            'n9 -> n8 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n4 []'

        );
    });
    it('is making CFG graph with nested loops  correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let arr= [true,false];\n' +
            '\n' +
            '    \n' +
            '    if (b <z) {\n' +
            '        c = c + 5;\n' +
            '\n' +
            '      while (arr[0]!=true){\n' +
            '        c=c+5;\n' +
            '      }\n' +
            '    \n' +
            '    }else if (b < z /2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '       x=\'sora\';\n' +
            '    }\n' +
            '    if (x==\'sora\'){\n' +
            '     c=5;\n' +
            '   }\n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,4')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0\n' +
            ' arr= [true,false]",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b <z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'arr[0]!=true",shape=diamond]\n' +
            'n5 [label="(5)\n' +
            'c=c+5",shape=box]\n' +
            'n6 [label="(6)\n' +
            'x==\'sora\'",shape=diamond,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'c=5",shape=box,style=filled,fillcolor=green]\n' +
            'n8 [label="(8)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'b < z /2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'c = c + x + 5",shape=box]\n' +
            'n11 [label="(11)\n' +
            'c = c + z + 5\n' +
            'x=\'sora\'",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n9 [label="false"]\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n100 [label="false"]\n' +
            'n5 -> n4 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n101 [label="false"]\n' +
            'n7 -> n101 []\n' +
            'n9 -> n10 [label="true"]\n' +
            'n9 -> n11 [label="false"]\n' +
            'n10 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n11 -> n100 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n6 []\n' +
            'n101 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n101 -> n8 []'

        );
    });
    it('is making CFG graph with only 2 statements correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '  let x=5;\n' +
            '  return x; \n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,4')
            ,
            'n1 [label="(1)\n' +
            ' x=5",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'return x",shape=box,style=filled,fillcolor=green]\n' +
            'n1 -> n2 []\n' +
            ''

        );
    });
    it('is making CFG graph with empty var declaration statement correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '  let a,b;\n' +
            '   if (x==5)\n' +
            '   return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,4')
            ,
            'n1 [label="(1)\n' +
            ' a,b",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'x==5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'return true",shape=box,style=filled,fillcolor=green]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            ''

        );
    });
    it('is making CFG graph with nested if AND nested while correctly - 1', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let arr= [true,false];\n' +
            '\n' +
            '    \n' +
            '\n' +
            '    if (b >= z) {\n' +
            '        c = c + 5;\n' +
            '      while (arr[0]==true){\n' +
            '        c=c+5;\n' +
            '      }\n' +
            '    \n' +
            '    }else if (b < z /2) {\n' +
            '       c=5;\n' +
            '       if (c==5){\n' +
            '        arr[0]=true;\n' +
            '        b=\'sora\';\n' +
            '       }\n' +
            '       else {\n' +
            '       c = 6;\n' +
            '         }\n' +
            '      \n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,100')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0\n' +
            ' arr= [true,false]",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b >= z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'arr[0]==true",shape=diamond]\n' +
            'n5 [label="(5)\n' +
            'c=c+5",shape=box]\n' +
            'n6 [label="(6)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'b < z /2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n8 [label="(8)\n' +
            'c=5",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c==5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'arr[0]=true\n' +
            'b=\'sora\'",shape=box,style=filled,fillcolor=green]\n' +
            'n11 [label="(11)\n' +
            'c = 6",shape=box]\n' +
            'n12 [label="(12)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n7 [label="false"]\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n100 [label="false"]\n' +
            'n5 -> n4 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n12 [label="false"]\n' +
            'n8 -> n9 []\n' +
            'n9 -> n10 [label="true"]\n' +
            'n9 -> n11 [label="false"]\n' +
            'n11 -> n100 []\n' +
            'n12 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n10 -> n100 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n6 []'

        );
    });

    it('is making CFG graph with nested if AND nested while correctly - 2', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let arr= [true,false];\n' +
            '\n' +
            '    \n' +
            '\n' +
            '    if (b >= z) {\n' +
            '        c = c + 5;\n' +
            '      while (arr[0]==true){\n' +
            '        c=c+5;\n' +
            '      }\n' +
            '    \n' +
            '    }else if (b < z /2) {\n' +
            '       c=5;\n' +
            '       if (c==5){\n' +
            '        arr[0]=true;\n' +
            '        c=6;\n' +
            '       }\n' +
            '       else {\n' +
            '       c = 6;\n' +
            '         }\n' +
            '      \n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '     if (arr[0]!=true)\n' +
            '      return x; \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,100')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0\n' +
            ' arr= [true,false]",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b >= z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'arr[0]==true",shape=diamond]\n' +
            'n5 [label="(5)\n' +
            'c=c+5",shape=box]\n' +
            'n6 [label="(6)\n' +
            'arr[0]!=true",shape=diamond,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'return x",shape=box]\n' +
            'n8 [label="(8)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'b < z /2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'c=5",shape=box,style=filled,fillcolor=green]\n' +
            'n11 [label="(11)\n' +
            'c==5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n12 [label="(12)\n' +
            'arr[0]=true\n' +
            'c=6",shape=box,style=filled,fillcolor=green]\n' +
            'n13 [label="(13)\n' +
            'c = 6",shape=box]\n' +
            'n14 [label="(14)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n9 [label="false"]\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n100 [label="false"]\n' +
            'n5 -> n4 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n8 [label="false"]\n' +
            'n9 -> n10 [label="true"]\n' +
            'n9 -> n14 [label="false"]\n' +
            'n10 -> n11 []\n' +
            'n11 -> n12 [label="true"]\n' +
            'n11 -> n13 [label="false"]\n' +
            'n13 -> n100 []\n' +
            'n14 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n12 -> n100 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n6 []'

        );
    });
    it('is making CFG graph with while statement at the code beginning correctly', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let arr= [true,false,false];\n' +
            '\n' +
            '     while (b >= z) {\n' +
            '        c = c + 1;\n' +
            '    }\n' +
            '   \n' +
            '    if (b==z){\n' +
            '     c=5;\n' +
            '\n' +
            '    }else if (b < z /2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    c = 6;\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0\n' +
            ' arr= [true,false,false]",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b >= z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 1",shape=box,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'b==z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'c=5",shape=box]\n' +
            'n6 [label="(6)\n' +
            'c = 6",shape=box,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n8 [label="(8)\n' +
            'b < z /2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c = c + x + 5",shape=box]\n' +
            'n10 [label="(10)\n' +
            'c = c + z + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n3 -> n2 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n8 [label="false"]\n' +
            'n5 -> n100 []\n' +
            'n6 -> n7 []\n' +
            'n8 -> n9 [label="true"]\n' +
            'n8 -> n10 [label="false"]\n' +
            'n9 -> n100 []\n' +
            'n10 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n6 []'

        );
    });
    it('is making CFG graph with while statement inside else if correctly', () => {
        let codeToParse=
            'function foo(x, y, z,d){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        if (b == 4) {\n' +
            '            c = 8;\n' +
            '        }\n' +
            '        c = c + 5;\n' +
            '    } else if (b < z * 2) {\n' +
            '       while (a < z) {\n' +
            '           c = a + b;\n' +
            '           z = c * 2;\n' +
            '           a++;\n' +
            '       }\n' +
            '   if (d!=true){\n' +
            '        c = c + z + 5;\n' +
            '}\n' +
            '    } else {\n' +
            '    \n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3,true')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b < z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'b == 4",shape=diamond]\n' +
            'n4 [label="(4)\n' +
            'c = 8",shape=box]\n' +
            'n5 [label="(5)\n' +
            'c = c + 5",shape=box]\n' +
            'n6 [label="(6)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'b < z * 2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n8 [label="(8)\n' +
            'a < z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c = a + b\n' +
            'z = c * 2\n' +
            'a++",shape=box,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'd!=true",shape=diamond,style=filled,fillcolor=green]\n' +
            'n11 [label="(11)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n7 [label="false"]\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n100 [label="false"]\n' +
            'n4 -> n100 []\n' +
            'n5 -> n101 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n101 [label="false"]\n' +
            'n8 -> n9 [label="true"]\n' +
            'n8 -> n10 [label="false"]\n' +
            'n10 -> n11 [label="true"]\n' +
            'n10 -> n101 [label="false"]\n' +
            'n11 -> n101 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n9 -> n8 []\n' +
            'n100 [label=" ", shape=circle]\n' +
            'n100 -> n5 []\n' +
            'n101 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n101 -> n6 []'

        );
    });
    it('is making CFG graph only 2 statements correctly', () => {
        let codeToParse=
            'function foo(x, y, z,d){\n' +
            'x=x+1;\n' +
            'return z+y;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3,true')
            ,
            'n1 [label="(1)\n' +
            'x=x+1",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'return z+y",shape=box,style=filled,fillcolor=green]\n' +
            'n1 -> n2 []\n' +
            ''

        );
    });
    it('is making CFG graph with 3 nested if and while statements correctly', () => {
        let codeToParse=
            'function foo(x, y, z,arr){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '\n' +
            'if (arr[c+2]!=\'sora\'){\n' +
            'c=5;\n' +
            'while(c==5){\n' +
            'c++;\n' +
            'let k=true;\n' +
            '}\n' +
            '\n' +
            '}\n' +
            'else{\n' +
            'c=7;\n' +
            'arr[0]=\'layla\';\n' +
            'if (arr[0]==\'lfayla\')\n' +
            'return false;\n' +
            '}\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3,[true,true,\'sora\']')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b < z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'arr[c+2]!=\'sora\'",shape=diamond,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'c=5",shape=box]\n' +
            'n6 [label="(6)\n' +
            'c==5",shape=diamond]\n' +
            'n7 [label="(7)\n' +
            'c++\n' +
            ' k=true",shape=box]\n' +
            'n8 [label="(8)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c=7\n' +
            'arr[0]=\'layla\'",shape=box,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'arr[0]==\'lfayla\'",shape=diamond,style=filled,fillcolor=green]\n' +
            'n11 [label="(11)\n' +
            'return false",shape=box]\n' +
            'n12 [label="(12)\n' +
            'b < z * 2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n13 [label="(13)\n' +
            'c = c + x + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n14 [label="(14)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n12 [label="false"]\n' +
            'n3 -> n100 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n9 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n101 [label="false"]\n' +
            'n10 -> n11 [label="true"]\n' +
            'n10 -> n101 [label="false"]\n' +
            'n12 -> n13 [label="true"]\n' +
            'n12 -> n14 [label="false"]\n' +
            'n13 -> n100 []\n' +
            'n14 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n7 -> n6 []\n' +
            'n9 -> n10 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n4 []\n' +
            'n101 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n101 -> n8 []'

        );
    });

    it('is making CFG graph with 3 nested if, else if, else and while statements correctly', () => {
        let codeToParse=
            'function foo(x,y,z){\n' +
            '     let a= x + 1;\n' +
            '     let b = a + y;\n' +
            '     let c = 0;\n' +
            ' \n' +
            '\n' +
            '     while(c==0){\n' +
            '           if (b<z){\n' +
            'let temp =  [1,2,true];\n' +
            '                 c = c + 5;\n' +
            '\n' +
            '           }\n' +
            '           else if(b<z *0.5){\n' +
            '              \n' +
            '                c = c + x + 5; \n' +
            '           \n' +
            '           }\n' +
            '           else{\n' +
            '                 c = c + z + 5;\n' +
            '                  if(c==2){\n' +
            '                        c=5;\n' +
            '                  }\n' +
            '                  else if(c==5){\n' +
            '                          c=8;\n' +
            '                  }\n' +
            '                  else{\n' +
            '                        c = 5;      \n' +
            '                \n' +
            '                    }\n' +
            '          }\n' +
            '         z = c;\n' +
            '    }\n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3')
            ,
            'n1 [label="(1)\n' +
            ' a= x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'c==0",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'b<z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            ' temp =  [1,2,true]\n' +
            'c = c + 5",shape=box]\n' +
            'n5 [label="(5)\n' +
            'z = c",shape=box,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'b<z *0.5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'c = c + x + 5",shape=box]\n' +
            'n8 [label="(8)\n' +
            'c = c + z + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c==2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'c=5",shape=box]\n' +
            'n11 [label="(11)\n' +
            'c==5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n12 [label="(12)\n' +
            'c=8",shape=box]\n' +
            'n13 [label="(13)\n' +
            'c = 5",shape=box,style=filled,fillcolor=green]\n' +
            'n14 [label="(14)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n14 [label="false"]\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n5 -> n2 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n8 [label="false"]\n' +
            'n7 -> n100 []\n' +
            'n8 -> n9 []\n' +
            'n9 -> n10 [label="true"]\n' +
            'n9 -> n11 [label="false"]\n' +
            'n10 -> n100 []\n' +
            'n11 -> n12 [label="true"]\n' +
            'n11 -> n13 [label="false"]\n' +
            'n12 -> n100 []\n' +
            'n13 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n4 -> n100 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n5 []'

        );
    });

    it('is making CFG graph that ends with normal statement and return  correctly', () => {
        let codeToParse=
            'function foo(x,y,z){\n' +
            '     let a= x + 1;\n' +
            '     let b = a + y;\n' +
            '     let c = 0;\n' +
            ' \n' +
            '\n' +
            '     while(c==0){\n' +
            '       c = c + 5;\n' +
            '     \n' +
            '    }\n' +
            '    temp = [1,2,true];\n' +
            '    let sora = true;\n' +
            '\n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3')
            ,
            'n1 [label="(1)\n' +
            ' a= x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'c==0",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'temp = [1,2,true]\n' +
            ' sora = true",shape=box,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n3 -> n2 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n4 -> n5 []'

        );
    });

    it('is making CFG graph that ends with normal statement and return correctly - with nested conditions', () => {
        let codeToParse=
            'function foo(x,y,z){\n' +
            '     let a= x + 1;\n' +
            '     let b = a + y;\n' +
            '     let c = 0;\n' +
            ' \n' +
            '\n' +
            '     while(c==0){\n' +
            '           if (b<z){\n' +
            '                 c = c + 5;\n' +
            '\n' +
            '           }\n' +
            '           else if(b<z *0.5){\n' +
            '              \n' +
            '                c = c + x + 5; \n' +
            '           \n' +
            '           }\n' +
            '           else{\n' +
            '                 c = c + z + 5;\n' +
            '                  if(c==2){\n' +
            '                        c=5;\n' +
            '                  }\n' +
            '                  else if(c==5){\n' +
            '                          c=8;\n' +
            '                  }\n' +
            '                  else{\n' +
            '                        c = 5;      \n' +
            '                \n' +
            '                    }\n' +
            '          }\n' +
            '         z = c;\n' +
            '    }\n' +
            ' temp = [1,2,true];\n' +
            '\n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3')
            ,
            'n1 [label="(1)\n' +
            ' a= x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'c==0",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'b<z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'c = c + 5",shape=box]\n' +
            'n5 [label="(5)\n' +
            'z = c",shape=box,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'b<z *0.5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'c = c + x + 5",shape=box]\n' +
            'n8 [label="(8)\n' +
            'c = c + z + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'c==2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'c=5",shape=box]\n' +
            'n11 [label="(11)\n' +
            'c==5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n12 [label="(12)\n' +
            'c=8",shape=box]\n' +
            'n13 [label="(13)\n' +
            'c = 5",shape=box,style=filled,fillcolor=green]\n' +
            'n14 [label="(14)\n' +
            'temp = [1,2,true]",shape=box,style=filled,fillcolor=green]\n' +
            'n15 [label="(15)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n14 [label="false"]\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n6 [label="false"]\n' +
            'n4 -> n100 []\n' +
            'n5 -> n2 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n8 [label="false"]\n' +
            'n7 -> n100 []\n' +
            'n8 -> n9 []\n' +
            'n9 -> n10 [label="true"]\n' +
            'n9 -> n11 [label="false"]\n' +
            'n10 -> n100 []\n' +
            'n11 -> n12 [label="true"]\n' +
            'n11 -> n13 [label="false"]\n' +
            'n12 -> n100 []\n' +
            'n13 -> n100 []\n' +
            'n14 -> n15 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n5 []'

        );
    });



    it('is making CFG graph that ends with normal statement and return  correctly', () => {
        let codeToParse=
            'function func(minIndex,maxIndex){\n' +
            'let list = [1,2,3];\n' +
            'let currentElement = 0;\n' +
            'let element = 3;\n' +
            'let currentIndex = 0;\n' +
            'while (minIndex<=maxIndex){\n' +
            '  minIndex++;\n' +
            '  currentIndex = minIndex;\n' +
            '  currentElement = list[currentIndex];\n' +
            '  if (currentElement==element){\n' +
            '    return currentIndex;\n' +
            '  }\n' +
            '  if (currentElement<element){\n' +
            '    minIndex = currentIndex + 1;\n' +
            '  }\n' +
            'if (currentElement > element){\n' +
            '    maxIndex = currentIndex - 1;\n' +
            '}\n' +
            '\n' +
            '\n' +
            '}\n' +
            'return true;\n' +
            '\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'2,2')
            ,
            'n1 [label="(1)\n' +
            ' list = [1,2,3]\n' +
            ' currentElement = 0\n' +
            ' element = 3\n' +
            ' currentIndex = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'minIndex<=maxIndex",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'minIndex++\n' +
            'currentIndex = minIndex\n' +
            'currentElement = list[currentIndex]",shape=box,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'currentElement==element",shape=diamond,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'return currentIndex",shape=box]\n' +
            'n6 [label="(6)\n' +
            'currentElement<element",shape=diamond,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'minIndex = currentIndex + 1",shape=box]\n' +
            'n8 [label="(8)\n' +
            'currentElement > element",shape=diamond,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'maxIndex = currentIndex - 1",shape=box]\n' +
            'n10 [label="(10)\n' +
            'return true",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n10 [label="false"]\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n6 [label="false"]\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n100 [label="false"]\n' +
            'n7 -> n100 []\n' +
            'n8 -> n9 [label="true"]\n' +
            'n8 -> n2 [label="false"]\n' +
            'n9 -> n2 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n3 -> n4 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n8 []'

        );
    });

    it('is making CFG graph that ends with nested if and while statements correctly', () => {
        let codeToParse=
            'function func(x){\n' +
            'if (x>5){\n' +
            'x++;\n' +
            'while (x>7){\n' +
            'x = x + 1;\n' +
            '}\n' +
            '}\n' +
            '\n' +
            'else{\n' +
            'x--;\n' +
            '}\n' +
            'return true;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'6')
            ,
            'n1 [label="(1)\n' +
            'x>5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'x++",shape=box,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'x>7",shape=diamond,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'x = x + 1",shape=box]\n' +
            'n5 [label="(5)\n' +
            'return true",shape=box,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'x--",shape=box]\n' +
            'n1 -> n2 [label="true"]\n' +
            'n1 -> n6 [label="false"]\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 [label="true"]\n' +
            'n3 -> n100 [label="false"]\n' +
            'n4 -> n3 []\n' +
            'n6 -> n100 []\n' +
            '\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n5 []'

        );
    });
    it('is making CFG graph with lecturer example correctly ', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b < z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'b < z * 2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'c = c + x + 5",shape=box,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n5 [label="false"]\n' +
            'n3 -> n100 []\n' +
            'n5 -> n6 [label="true"]\n' +
            'n5 -> n7 [label="false"]\n' +
            'n6 -> n100 []\n' +
            'n7 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n4 []'

        );
    });

    it('is making CFG graph with very complicated nested conditions correctly ', () => {
        let codeToParse=
            'function foo(x, y, z,arr){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '       \n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '      arr[b-2]=\'sora\';\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    \n' +
            '\n' +
            'if (arr[c+2]==\'sora\'){\n' +
            'c=5;\n' +
            'while(c==5){\n' +
            '\n' +
            'c=c+1;\n' +
            '}\n' +
            '}\n' +
            '    \n' +
            '    return c;\n' +
            '}';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'1,2,3,[1,2,3]')
            ,
            'n1 [label="(1)\n' +
            ' a = x + 1\n' +
            ' b = a + y\n' +
            ' c = 0",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'b < z",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = c + 5",shape=box]\n' +
            'n4 [label="(4)\n' +
            'arr[c+2]==\'sora\'",shape=diamond,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'c=5",shape=box,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'c==5",shape=diamond,style=filled,fillcolor=green]\n' +
            'n7 [label="(7)\n' +
            'c=c+1",shape=box,style=filled,fillcolor=green]\n' +
            'n8 [label="(8)\n' +
            'return c",shape=box,style=filled,fillcolor=green]\n' +
            'n9 [label="(9)\n' +
            'b < z * 2",shape=diamond,style=filled,fillcolor=green]\n' +
            'n10 [label="(10)\n' +
            'c = c + x + 5\n' +
            'arr[b-2]=\'sora\'",shape=box,style=filled,fillcolor=green]\n' +
            'n11 [label="(11)\n' +
            'c = c + z + 5",shape=box]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n9 [label="false"]\n' +
            'n3 -> n100 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n101 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n6 -> n7 [label="true"]\n' +
            'n6 -> n101 [label="false"]\n' +
            'n7 -> n6 []\n' +
            'n9 -> n10 [label="true"]\n' +
            'n9 -> n11 [label="false"]\n' +
            'n11 -> n100 []\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n10 -> n100 []\n' +
            'n100 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n100 -> n4 []\n' +
            'n101 [label=" ", shape=circle,style=filled,fillcolor=green]\n' +
            'n101 -> n8 []'

        );
    });

    it('is making CFG graph with array assignment correctly ', () => {
        let codeToParse=
            'function foo(x, y, z){\n' +
            '            let a = y - 1;\n' +
            '            let b = a + y+x.length;\n' +
            '            let c = 0;\n' +
            '            let arr=[1,2,3];\n' +
            '            x[a]=\'layla\';\n' +
            '            while (x[a] == \'layla\'){\n' +
            '            c = a + b;\n' +
            '            z = c * 2;\n' +
            '            if (z==14)\n' +
            '            return true;\n' +
            '            \n' +
            '            }\n' +
            '            \n' +
            '            return z;\n' +
            '            }';

        let table =parseCode(codeToParse); //make table
        assert.equal(createCFG(codeToParse,table,'[1,2,3],2,3')
            ,
            'n1 [label="(1)\n' +
            ' a = y - 1\n' +
            ' b = a + y+x.length\n' +
            ' c = 0\n' +
            ' arr=[1,2,3]\n' +
            'x[a]=\'layla\'",shape=box,style=filled,fillcolor=green]\n' +
            'n2 [label="(2)\n' +
            'x[a] == \'layla\'",shape=diamond,style=filled,fillcolor=green]\n' +
            'n3 [label="(3)\n' +
            'c = a + b\n' +
            'z = c * 2",shape=box,style=filled,fillcolor=green]\n' +
            'n4 [label="(4)\n' +
            'z==14",shape=diamond,style=filled,fillcolor=green]\n' +
            'n5 [label="(5)\n' +
            'return true",shape=box,style=filled,fillcolor=green]\n' +
            'n6 [label="(6)\n' +
            'return z",shape=box,style=filled,fillcolor=green]\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n6 [label="false"]\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n2 [label="false"]\n' +
            '\n' +
            'n1 -> n2 []\n' +
            'n3 -> n4 []'

        );
    });

});

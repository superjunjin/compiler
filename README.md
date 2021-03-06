# 1.1 词法分析

## 概念

- 总流程：有限状态机，逐个输入字符分析，确定一个token（词法分析的词）后，保存到列表中。
- 初始状态分析（initToken方法）：确定一个token后都会回到初始状态，然后决定下一个要去的状态
- 状态分析（tokenize方法）：在每个状态中，累计字符，直到形成token。

## bug

- 最后一个token没有分析到：循环到最后一个字符时，tokenText已经形成好，但是没有后续字符使其终结此token进入initToken了，因此在输入字符循环外加入initToken方法去形成最后一个token

```javascript
    // 把最后一个token送进去
    // 循环到最后一个字符时，tokenText已经形成好，但是没有后续字符使其终结此token进入initToken了
    if (tokenText.length > 0) {
        initToken();
    }
```
## 图示

![Lexer](/img/Lexer.png)
![Lexer](/img/Lexer2.png)

# 1.2 语法分析

## 1.2.1 实现乘法

### 概念

- 乘法分析表达式：multiplicative -> primary | primary * multiplicative
- 首先，实现IntLiteral也就是乘法表达式文法的第一个字符分析，参见方法SimpleCalculator中的primary
- 其次，实现乘法表达式的分析，参见方法SimpleCalculator中的multiplicative
- 消耗token：tokens.shift()防范消耗掉tokens数组第一个token
- 预查token：tokens[0]
- 左递归：第一步就递归就会无限循环下去，循环不完。但是经过一部分分析后，在最后去用递归，应该可以每次递归都逐步拆解，直到循环完。

### bug

- 避免递归时报错，影响后续的循环

```javascript
    if(node.child){
        for (let index = 0; index < node.child.length; index++) {
            const element = node.child[index];
            dumpAST(element, indent + "\t"); 
        }
    } 
```

### 图示

![3](/img/3.png)


## 1.2.2 实现加法

### 概念

- 加法分析表达式： additive -> multiplicative | multiplicative + additive
- 加法算法解读：
> 我们先尝试能否匹配乘法表达式，如果不能，那么这个节点肯定不是加法节点，因为加法表达式的两个产生式都必须首先匹配乘法表达式。遇到这种情况，返回 null 就可以了，调用者就这次匹配没有成功。
如果乘法表达式匹配成功，那就再尝试匹配加号右边的部分，也就是去递归地匹配加法表达式。如果匹配成功，就构造一个加法的 ASTNode 返回。
- 优先级：在加法规则中，会嵌套地匹配乘法规则。我们通过文法的嵌套，实现了计算的优先级。

### 问题
- 结合性：现在是从右向左结合，不符合从左向右的计算规则。所以，<font color="red">我们前面的方法其实并没有完美地解决左递归，因为它改变了加法运算的结合性规则</font>

### 图示

![4](/img/4.png)

## 1.2.3 整型声明分析
> 从左向右分析，再用下加法表达式算法方法

## 1.2.4 左右括号
### 方法分析
1. 在基础表达式primary方法判断左括号
2. 判断左括号后，进入算数表达式方法additive。
3. 消耗掉算术表达式的字符后，形成算数表达式node
4. 再返回primary方法判断右括号

- 如果左括号是第一个字符，按上述分析进行。
- 如果左括号不是第一个字符，则肯定在加减乘除之后。也就是进入additive或multiplicative方法消耗掉加减乘除符号后，再递归进入additive或multiplicative方法，还是要进入primary方法判断左括号。

## 1.2.5 表达式求值
> 递归求每个节点的算数值
### 图示
![5](/img/5.png)

## 1.2.6 左结合
### 概念
- 问题：上边算法的问题是用右递归算法形成从**右向左结合**（右结合）的过程
- 结合性：结合性是跟左递归还是右递归有关的，左递归导致左结合，右递归导致右结合。
- 避免左递归：左递归可以通过改写语法规则来避免，而改写后的语法又可以表达成简洁的 EBNF 格式，从而启发我们用**循环代替右递归**。
- 尾递归：尾递归函数的最后一句是递归地调用自身。编译程序通常都会把尾递归转化为一个循环语句，使用的原理跟上面的伪代码是一样的。相对于递归调用来说，循环语句对系统资源的开销更低，因此，**把尾递归转化为循环语句也是一种编译优化技术**。
- 新表达式
  - 加法：add -> mul (+ mul)$ ^* $
  - 乘法：mul -> pri (* pri)$ ^* $

### 图示
![6](/img/6.png)

### 公式显示问题
- 装Chrome插件MathJax
- 两个$之间插入公式

## 1.2.7 脚本解析
### 概念
- 主要内容：主要针对变量声明和初始化语句intDeclare，表达式语句expressionStatement，赋值语句assignmentStatement进行解析出树🌲结构
- 主要逻辑：
  - tokens数组进入while循环依次判断是intDeclare，expressionStatement，assignmentStatement三种语句中的哪种语句。
  - 每次循环判断出一种语句加入到tree中，都不属于就报错。
  - expressionStatement、assignmentStatement如果不能匹配上（返回null），必须进行回溯，找回消耗掉的token进行下次判断。
- 回溯：
  - 概念：尝试一个规则不成功之后，恢复到原样，再去尝试另外的规则，这个现象就叫做“回溯”。
  - 缺点：缺点是回溯会拉低一点儿效率
  - 优化：实现带有预测分析的递归下降，以及非递归的预测分析
  
### 图示
![7](/img/7.png)

## 1.2.8 命令行执行脚本
### 概念
- 服务：起node服务了，`node app.js`
- 调试：`node --inspect app.js`
- node
  - repl：交互式解释器，repl 模块提供了一种“读取-求值-输出”循环（REPL）的实现，它可作为一个独立的程序或嵌入到其他应用中。 
    - repl.start：prompt-初始命令行提示，eval：对输入内容cmd设置自定义处理函数，callback送出数据，
    writer：对输出数据的处理函数
      - repl.start.defineCommand：自定义命令行，这里定义tree命令运行语句才会输出树🌲结构，即运行`.tree 2*3;`
### 代码
- Map：存取变量的键值对用到ES6的Map去存取
  - `const variables = new Map();`
  - `variables.has(varName)`
  - `variables.get(varName)`
  - `variables.set(varName3, varValue3);`
- switch case：没有break，case顺序执行这个用法，对于我有点别扭。但我看java和javascript都是这样用。理解成没有break，多个case是或的关系都会执行（其实是每个case下没有代码的我理解，case下还有代码的别扭）。
- node命令行服务代码：
```javascript
const repl = require('repl');
const { parseParser, evaluateParser, dumpASTParser } = require('./SimpleParser');

const replServer = repl.start({ prompt: 'Simple script language! \n> ', eval: myEval });

replServer.defineCommand('tree', {
    help: '输出树🌲结构',
    action(name) {
        this.clearBufferedCommand();
        if (name.trimEnd().endsWith(";")) {
            const tree = parseParser(name);  // 树结构解析
            dumpASTParser(tree, ''); // 树结构打印输出
            const result = evaluateParser(tree, "", true); // 树结构求值
            console.log(result);
        }else{
            console.log('请输入分号结尾的语句');
        }

        this.displayPrompt();
    }
});

function myEval(cmd, context, filename, callback) {
    if (cmd.trimEnd().endsWith(";")) {
        const tree = parseParser(cmd); // 树结构解析
        const result = evaluateParser(tree, "", false); // 树结构求值
        callback(null, result);
    } else {
        callback(null, '请输入分号结尾的语句');
    }

}

```

- 新求值逻辑代码：只有变量声明和初始化语句intDeclare和赋值语句assignmentStatement的求值是新逻辑的，其他以前都写过了，**注意㊗️接着执行下面的代码那里**。`case ASTNodeType.AssignmentStmt`下的代码不写也行，都用一个逻辑求值（把等号右边的tree求出值）。


```javascript
case ASTNodeType.AssignmentStmt:
    const varName2 = node.text;
    if (!variables.has(varName2)){
        console.log("unknown variable: " + varName2);
    }
    //接着执行下面的代码   
case ASTNodeType.IntDeclaration:
    const varName3 = node.text;
    let varValue3 = null;
    if (node.child.length > 0) {
        const child = node.child[0];
        result = evaluateParser(child, indent + "\t");
        varValue3 = Number(result);
    }
    variables.set(varName3, varValue3);
    break;
```
### 图示
- 一行多个语句（加tree）
![8](/img/8.png)

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
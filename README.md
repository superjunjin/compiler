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

- 乘法分析表达式：multiplicativeExpression: IntLiteral | IntLiteral Star multiplicativeExpression;
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
/**
 * 实现一个计算器，但计算的结合性是有问题的。因为它使用了下面的语法规则：
 *
 * additive -> multiplicative | multiplicative + additive
 * multiplicative -> primary | primary * multiplicative    
 *
 * 递归项在右边，会自然的对应右结合。我们真正需要的是左结合。
 */

const { ASTNodeType } = require('./ASTNodeType')
const { TokenType } = require('./TokenType')

/**
 * 语法解析：基础表达式。匹配乘法表达式文法的第一个字符，也就是那个primary
 * multiplicative -> primary | primary * multiplicative 
 * @return node 节点集合
 */
const primary = (tokens) => {
    let node = {};
    let token = tokens[0];
    if (token != null) {
        if (token.type == TokenType.IntLiteral) {//整型字面量
            token = tokens.shift();// 消耗掉tokens数组第一个token
            node = {type: ASTNodeType.IntLiteral, text: token.text};
        }else if (token.type == TokenType.Identifier) {//标识符
            token = tokens.shift();
            node = {type: ASTNodeType.Identifier, text: token.text};
        }else if (token.type == TokenType.LeftParen){
            tokens.shift();
            node = additive(tokens);//生成好算数表达式的node，且只剩下右括号没有被消耗掉。
            if (node != null) {
                token = tokens[0];
                if (token != null && token.type == TokenType.RightParen) {
                    tokens.shift();
                } else {
                    console.log("expecting right parenthesis");
                }
            } else {
                console.log("expecting an additive expression inside parenthesis");
            }
        }
    }
    return node;  //这个方法也做了AST的简化，就是不用构造一个primary节点，直接返回子节点。因为它只有一个子节点。
}

/**
 * 语法解析：乘法表达式
 * multiplicative -> primary | primary * multiplicative 
 * @return node 节点集合
 * 第一个字符和后面的表达式相乘，后面的表达式递归调用下去。
 */
// const multiplicative = (tokens) => {
//     const child1 = primary(tokens);// 返回第一个节点primary
//     let node = child1;

//     let token = tokens[0];
//     if (child1 != null && token != null) {
//         if (token.type == TokenType.Star || token.type == TokenType.Slash) {
//             token = tokens.shift();
//             let child2 = multiplicative(tokens);// 递归调用下去
//             if (child2 != null) {
//                 node = {type: ASTNodeType.Multiplicative, text: token.text, child: []};
//                 node.child.push(child1);
//                 node.child.push(child2);
//             } else {
//                 console.log("invalid multiplicative expression, expecting the right part.");
//             }
//         }
//     }
//     return node;
// }

/**
 * 语法解析：乘法表达式新
 * mul -> pri (* pri)*
 * @return node 节点集合
 * 节点1加节点2形成新的节点，再不停循环加新的节点下去。直到下个输入字符没有乘号（停止循环）
 */
const multiplicative = (tokens) => {
    let child1 = primary(tokens);// 返回第一个节点primary
    let node = child1;
 
    if (child1 != null) {
        while(true){
            let token = tokens[0];
            if (token != null && (token.type == TokenType.Star || token.type == TokenType.Slash)) {
                token = tokens.shift();
                const child2 = primary(tokens);// 计算下级节点
                if (child2 != null) {
                    node = {type: ASTNodeType.Multiplicative, text: token.text, child: []};
                    node.child.push(child1);
                    node.child.push(child2);
                    child1 = node;
                } else {
                    console.log("invalid multiplicative expression, expecting the right part.");
                }
            }else{
                break;
            }
        }
        
    }
    return node;
}

/**
 * 语法解析：加法表达式
 * additive -> multiplicative | multiplicative + additive
 * @return node 节点集合
 * 第一个字符和后面的表达式相乘，后面的表达式递归调用下去。
 */
// const additive = (tokens) => {
//     const child1 = multiplicative(tokens);// 返回第一个节点multiplicative
//     let node = child1;

//     let token = tokens[0];
//     if (child1 != null && token != null) {
//         if (token.type == TokenType.Plus || token.type == TokenType.Minus) {
//             token = tokens.shift();
//             let child2 = additive(tokens);// 递归调用下去
//             if (child2 != null) {
//                 node = {type: ASTNodeType.Additive, text: token.text, child: []};
//                 node.child.push(child1);
//                 node.child.push(child2);
//             } else {
//                 console.error("invalid additive expression, expecting the right part.");
//             }
//         }
//     }
//     return node;
// }

/**
 * 语法解析：加法表达式
 * add -> mul (+ mul)* 
 * @return node 节点集合
 * 节点1加节点2形成新的节点，再不停循环加新的节点下去。直到下个输入字符没有加号（停止循环）
 */
const additive = (tokens) => {
    let child1 = multiplicative(tokens);// 返回第一个节点multiplicative
    let node = child1;

    if (child1 != null) {
        while(true){
            let token = tokens[0];
            if (token != null && (token.type == TokenType.Plus || token.type == TokenType.Minus)) {
                token = tokens.shift();
                let child2 = multiplicative(tokens);// 递归调用下去
                if (child2 != null) {
                    node = {type: ASTNodeType.Additive, text: token.text, child: []};
                    node.child.push(child1);
                    node.child.push(child2);
                    child1 = node;
                } else {
                    console.error("invalid additive expression, expecting the right part.");
                }
            }else{
                break;
            }
        }
        
    }
    return node;
}

/**
 * 整型变量声明语句，如：
 * int a;
 * int b = 2*3;
 *
 * @return node 节点集合
 */
const intDeclare = (tokens) => {
    let node = null;
    let token = tokens[0];    //预读
    if (token != null && token.type == TokenType.Int) {   //匹配Int
        token = tokens.shift();      //消耗掉int
        if (tokens[0].type == TokenType.Identifier) { //匹配标识符
            token = tokens.shift();  //消耗掉标识符
            //创建当前节点，并把变量名记到AST节点的文本值中，这里新建一个变量子节点也是可以的
            node = { type: ASTNodeType.IntDeclaration, text: token.text , child: []};
            token = tokens[0];  //预读
            if (token != null && token.type == TokenType.Assignment) {
                tokens.shift();      //消耗掉等号
                const child = additive(tokens);  //匹配一个表达式
                if (child == null) {
                    console.error("invalide variable initialization, expecting an expression");
                }
                else{
                    node.child.push(child);
                }
            }
        } else {
            console.error("variable name expected");
        }

        if (node != null) {
            token = tokens[0];
            if (token != null && token.type == TokenType.SemiColon) {
                tokens.shift();
            } else {
                console.error("invalid statement, expecting semicolon");
            }
        }
    }
    return node;
}

/**
 * 语法解析：根节点
 * @return node 节点集合
 */
const prog = (tokens) => {
    let node = { type: ASTNodeType.Programm, text: "Calculator" , child: []};
    
    const child = additive(tokens);

    if (child != null) {
        node.child.push(child);
    }
    return node;
}

/**
 * 词法分析后，语法分析，并返回根节点
 * @param code
 * @return rootNode
 */
const parse = (code) => {
    const tokens = tokenize(code);

    const rootNode = prog(tokens);

    return rootNode;
}

/**
 * 对某个AST节点求值，并打印求值过程。
 * @param node
 * @param indent  打印输出时的缩进量，用tab控制
 * @return result 结果值
 */
const evaluate = (node, indent) => {
    let result = 0;
    console.log(indent + "Calculating: " + node.type);
    switch (node.type) {
        case ASTNodeType.Programm:
            for (let index = 0; index < node.child.length; index++) {
                result = evaluate(node.child[index], indent + "\t")
            }
            break;
        case ASTNodeType.Additive:
            const child1 = node.child[0];
            const value1 = evaluate(child1, indent + "\t");
            const child2 = node.child[1];
            const value2 = evaluate(child2, indent + "\t");
            if (node.text == "+") {
                result = value1 + value2;
            } else {
                result = value1 - value2;
            }
            break;
        case ASTNodeType.Multiplicative:
            const child3 = node.child[0];
            const value3 = evaluate(child3, indent + "\t");
            const child4 = node.child[1];
            const value4 = evaluate(child4, indent + "\t");
            if (node.text == "*") {
                result = value3 * value4;
            } else {
                result = value3 / value4;
            }
            break;
        case ASTNodeType.IntLiteral:
            result = Number(node.text);
            break;
        default:
    }
    console.log(indent + "Result: " + result);
    return result;
}

/**
 * 打印输出AST的树状结构
 * @param node
 * @param indent 缩进字符，由tab组成，每一级多一个tab
 */
const dumpAST = (node, indent) => {
    console.log(indent + node.type + " " + node.text);
    if(node.child){
        for (let index = 0; index < node.child.length; index++) {
            const element = node.child[index];
            dumpAST(element, indent + "\t\t"); 
        }
    } 
}

exports.additive = additive;
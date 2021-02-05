/**
 * 一个简单的语法解析器。
 * 能够解析变量声明和初始化语句intDeclare、简单的表达式expressionStatement、赋值语句assignmentStatement。
 * 它支持的语法规则为：
 *
 * programm -> intDeclare | expressionStatement | assignmentStatement
 * intDeclare -> 'int' Id ( = additive) ';'
 * expressionStatement -> addtive ';'
 * assignmentStatement -> Identifier '=' additiveExpression ';';
 * addtive -> multiplicative ( (+ | -) multiplicative)*
 * multiplicative -> primary ( (* | /) primary)*
 * primary -> IntLiteral | Id | (additive)
 */
const SimpleLexer = require('./SimpleLexer');
const { ASTNodeType } = require('./ASTNodeType')
const { TokenType } = require('./TokenType')
const { additive } = require('./SimpleCalculator')

let tokens;// tokens词法数组
const variables = new Map(); // 存变量名键值对的Map

/**
 * 解析脚本
 * @param {String} 脚本字符串
 * @return {Object} 节点树集合
 */
const parseParser = (script) => {
    // const tokens = tokenize(script);
    // const rootNode = prog(tokens);
    // return rootNode;

    tokens = SimpleLexer.tokenize(script); // 词法分析后，
    const tree = progParser();// 语法分析，并返回根节点
    // dumpASTParser(tree, '');
    return tree;
}


/**
 * 打印输出AST的树状结构
 * @param node
 * @param indent 缩进字符，由tab组成，每一级多一个tab
 */
const dumpASTParser = (node, indent) => {
    // strTree = strTree + indent + node.type + " " + node.text + "\n"
    console.log(indent + node.type + " " + node.text);
    if(node.child){
        for (let index = 0; index < node.child.length; index++) {
            const element = node.child[index];
            dumpASTParser(element, indent + "\t\t"); 
        }
    } 
    // return strTree;
}

/**
 * 遍历AST，计算值。
 * @param node
 * @return result
 */
const evaluateParser = (node, indent, verbose) => {
    let result = 0;   
    if (verbose) {
        console.log(indent + "Calculating: " + node.type);
    }
    switch (node.type) {
        case ASTNodeType.Programm:
            for (let index = 0; index < node.child.length; index++) {
                result = evaluateParser(node.child[index], indent + "\t")
            }
            break;
        case ASTNodeType.Additive:
            const child1 = node.child[0];
            const value1 = evaluateParser(child1, indent + "\t");
            const child2 = node.child[1];
            const value2 = evaluateParser(child2, indent + "\t");
            if (node.text == "+") {
                result = value1 + value2;
            } else {
                result = value1 - value2;
            }
            break;
        case ASTNodeType.Multiplicative:
            const child3 = node.child[0];
            const value3 = evaluateParser(child3, indent + "\t");
            const child4 = node.child[1];
            const value4 = evaluateParser(child4, indent + "\t");
            if (node.text == "*") {
                result = value3 * value4;
            } else {
                result = value3 / value4;
            }
            break;
        case ASTNodeType.IntLiteral:
            result = Number(node.text);
            break;
        case ASTNodeType.Identifier:
            const varName = node.text;
            if (variables.has(varName)) {
                const value = variables.get(varName);
                if (value != null) {
                    result = Number(value);
                } else {
                    console.log("variable " + varName + " has not been set any value");
                }
            }
            else{
                console.log("unknown variable: " + varName);
            }
            break;
        case ASTNodeType.AssignmentStmt:
            const varName2 = node.text;
            if (!variables.has(varName2)){
                console.log("unknown variable: " + varName2);
            }   //接着执行下面的代码
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

        default:
    }

    if (verbose) {
        console.log(indent + "Result: " + result);
    } else if (indent == "") { // 顶层的语句
        if (node.type == ASTNodeType.IntDeclaration || node.type == ASTNodeType.AssignmentStmt) {
            console.log(node.text + ": " + result);
        }else if (node.type != ASTNodeType.Programm){
            console.log(result);
        }
    }
    return result;
}

/**
 * AST的根节点，解析的入口，遵循以下产生式
 * programm -> intDeclare | expressionStatement | assignmentStatement
 * @param {Array} 词法数组
 * @return {Object} 节点树集合
 */
const progParser = () => {
    let node = { type: ASTNodeType.Programm, text: "pwc" , child: []};
    // 分析出一个语句分析下一个语句，循环下去，直到没有语句
    // 分析出一个语句node都加到树中
    while (tokens[0] != null) {
        // 匹配第一个产生式intDeclare
        let child = intDeclareStatement();
        // 第一个产生式intDeclare不匹配，返回空。
        // 匹配第二个产生式expressionStatement
        if (child == null) {
            child = expressionStatement();
        }
        // 第二个产生式expressionStatement不匹配，返回空。tokens回溯到初始
        // 匹配第三个产生式assignmentStatement
        if (child == null) {
            child = assignmentStatement();
        }

        if (child != null) {
            node.child.push(child);
        } else {
            console.log("unknown statement");
        }
    }

    return node;
}


 
/**
 * 整型变量声明，如：
 * int a;
 * int b = 2*3;
 * @param tokens
 * @return node
 */
const intDeclareStatement = () => {
    let node = null;
    let token = tokens[0];
    if (token != null && token.type == TokenType.Int) {
        token = tokens.shift();
        if (tokens[0].type == TokenType.Identifier) {
            token = tokens.shift();
            node = {type: ASTNodeType.IntDeclaration, text: token.text, child: []};
            token = tokens[0];
            if (token != null && token.type == TokenType.Assignment) {
                tokens.shift();  //取出等号
                const child = additive(tokens);
                if (child == null) {
                    console.log("invalide variable initialization, expecting an expression");
                }
                else{
                    node.child.push(child);
                }
            }
        } else {
            console.log("variable name expected");
        }

        if (node != null) {
            token = tokens[0];
            if (token != null && token.type == TokenType.SemiColon) {
                tokens.shift();
            } else {
                console.log("invalid statement, expecting semicolon");
            }
        }
    }
    return node;
}

/**
 * 表达式语句，即表达式后面跟个分号。
 * @param tokens
 * @return node
 */
const expressionStatement = () => {
    const _tokens = [...tokens]; 
    // const pos = tokens.getPosition();
    let node = additive(tokens);
    if (node != null) {
        const token = tokens[0];
        if (token != null && token.type == TokenType.SemiColon) {
            tokens.shift();
        } else {
            node = null;
            tokens = _tokens; // 回溯
        }
    }
    return node;  //直接返回子节点，简化了AST。
}

/**
 * 赋值语句，如age = 10*2;
 * @param tokens
 * @return node
 */
const assignmentStatement = () => {
    let node = null;
    let token = tokens[0];    //预读，看看下面是不是标识符
    const _tokens = [...tokens]; 
    if (token != null && token.type == TokenType.Identifier) {
        token = tokens.shift();      //读入标识符
        node = {type: ASTNodeType.AssignmentStmt, text: token.text, child: []};
        token = tokens[0];      //预读，看看下面是不是等号
        if (token != null && token.type == TokenType.Assignment) {
            tokens.shift();          //取出等号
            const child = additive(tokens);
            if (child == null) {    //出错，等号右面没有一个合法的表达式
                console.log("invalide assignment statement, expecting an expression");
            }
            else{
                node.child.push(child);   //添加子节点
                token = tokens[0];  //预读，看看后面是不是分号
                if (token != null && token.type == TokenType.SemiColon) {
                    tokens.shift();      //消耗掉这个分号
                } else {                //报错，缺少分号
                    console.log("invalid statement, expecting semicolon");
                }
            }
        }
        else {
            tokens = _tokens;             //回溯，吐出之前消化掉的标识符
            node = null;
        }
    }
    return node;
}

exports.parseParser = parseParser;
exports.dumpASTParser = dumpASTParser;
exports.evaluateParser = evaluateParser;
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


/**
 * 解析脚本
 * @param {String} 脚本字符串
 * @return {Object} 节点树集合
 */
const parseParser = (script) => {
    const tokens = tokenize(script);
    const rootNode = prog(tokens);
    return rootNode;
}

/**
 * 打印输出AST的树状结构
 * @param node
 * @param indent 缩进字符，由tab组成，每一级多一个tab
 */
const dumpASTParser = (node, indent) => {
    console.log(indent + node.type + " " + node.text);
    if(node.child){
        for (let index = 0; index < node.child.length; index++) {
            const element = node.child[index];
            dumpAST(element, indent + "\t\t"); 
        }
    } 
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
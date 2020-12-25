


let tokenText = '';   //临时保存token的文本
let tokens = [];       //保存解析出来的Token
let token = {};        //当前正在解析的Token 

/**
 * 有限状态机进入初始状态。
 * 这个初始状态其实并不做停留，它马上进入其他状态。
 * 开始解析的时候，进入初始状态；某个Token解析完毕，也进入初始状态，在这里把Token记下来，然后建立一个新的Token。
 * @param ch 字符
 * @return newState 跳转到新的状态
 */
const initToken = (ch) => {
    // 一个token记录结束，再次进入初始状态后，记录完整的token字符串，tokens列表
    if(tokenText.length > 0){
        token.text = tokenText;
        tokens.push(token);
        tokenText = '';
        token = {};
    }
     // 进入初始状态后，根据遇到的字符，马上进入其他状态（记录当前token类型，记录当前token第一个字符）
    let newState = DfaState.Initial;
    if (isAlpha(ch)) { // 第一个字符是字母
        if (ch == 'i') {
            newState = DfaState.Id_int1;//进入关键字int的第一个字符状态
        } else {
            newState = DfaState.Id; //进入表示符Id状态
        }
        token.type = TokenType.Identifier;
        tokenText += ch;
    } else if (isDigit(ch)){  // 第一个字符是数字
        newState = DfaState.IntLiteral;
        token.type = TokenType.IntLiteral;
        tokenText += ch;
    } else if (ch == '>'){
        newState = DfaState.GT;
        token.type = TokenType.GT;
        tokenText += ch;
    } else if (ch == '+') {
        newState = DfaState.Plus;
        token.type = TokenType.Plus;
        tokenText += ch;
    } else if (ch == '-') {
        newState = DfaState.Minus;
        token.type = TokenType.Minus;
        tokenText += ch;
    } else if (ch == '*') {
        newState = DfaState.Star;
        token.type = TokenType.Star;
        tokenText += ch;
    } else if (ch == '/') {
        newState = DfaState.Slash;
        token.type = TokenType.Slash;
        tokenText += ch;
    } else if (ch == ';') {
        newState = DfaState.SemiColon;
        token.type = TokenType.SemiColon;
        tokenText += ch;
    } else if (ch == '(') {
        newState = DfaState.LeftParen;
        token.type = TokenType.LeftParen;
        tokenText += ch;
    } else if (ch == ')') {
        newState = DfaState.RightParen;
        token.type = TokenType.RightParen;
        tokenText += ch;
    } else if (ch == '=') {
        newState = DfaState.Assignment;
        token.type = TokenType.Assignment;
        tokenText += ch;
    } else {
        newState = DfaState.Initial; // skip all unknown patterns
    }
    return newState;
}


/**
 * 解析字符串，形成Token。
 * 这是一个有限状态自动机，在不同的状态中迁移。
 * @param code
 * @return 
 */
// 第一个token（字符串'int'），经过Id_int1到Id_int3状态后，进入initToken方法，tokenText累加为‘int’，当前token被记录为text为‘int‘和type。
const tokenize = (code) => {
    let state = DfaState.Initial;// 当前状态
    const codeStrArr = code.split(''); // 字符串数组
    for (let index = 0; index < codeStrArr.length; index++) {
        const ch = codeStrArr[index];
        switch (state) {
            case DfaState.Initial:  // 初始态和每次确定当前token后在变为初始态
                state = initToken(ch);  // 为当前字符确定后续状态
                break;
            case DfaState.Id:
                if (isAlpha(ch) || isDigit(ch)) {
                    tokenText += ch;      //保持标识符状态
                } else {
                    state = initToken(ch);      //退出标识符状态，并保存Token
                }
                break;
            case DfaState.GT:
                if (ch == '=') {
                    token.type = TokenType.GE;  //转换成GE
                    state = DfaState.GE;
                    tokenText += ch;
                } else {
                    state = initToken(ch);      //退出GT状态，并保存Token
                }
                break;
            case DfaState.GE:
            case DfaState.Assignment:
            case DfaState.Plus:
            case DfaState.Minus:
            case DfaState.Star:
            case DfaState.Slash:
            case DfaState.SemiColon:
            case DfaState.LeftParen:
            case DfaState.RightParen:
                state = initToken(ch);          //退出当前状态，并保存Token
                break;
            case DfaState.IntLiteral:
                if (isDigit(ch)) {
                    tokenText += ch;       //继续保持在数字字面量状态
                } else {
                    state = initToken(ch);      //退出当前状态，并保存Token
                }
                break;
            case DfaState.Id_int1:
                if (ch == 'n') {
                    state = DfaState.Id_int2;
                    tokenText += ch;
                }
                else if (isDigit(ch) || isAlpha(ch)){
                    state = DfaState.Id;    //切换回Id状态
                    tokenText += ch;
                }
                else {
                    state = initToken(ch);
                }
                break;
            case DfaState.Id_int2:
                if (ch == 't') {
                    state = DfaState.Id_int3;
                    tokenText += ch;
                }
                else if (isDigit(ch) || isAlpha(ch)){
                    state = DfaState.Id;    //切换回id状态
                    tokenText += ch;
                }
                else {
                    state = initToken(ch);
                }
                break;
            case DfaState.Id_int3:
                if (isBlank(ch)) {
                    token.type = TokenType.Int;
                    state = initToken(ch);
                }
                else{
                    state = DfaState.Id;    //切换回Id状态
                    tokenText += ch;
                }
                break;
            default:
                break;
        }
    }
}

/**
 * 有限状态机的各种状态。
 */
const DfaState = {
    Initial: 'Initial',

    If:'If', Id_if1: 'Id_if1', Id_if2: 'Id_if2', Else: 'Else', Id_else1: 'Id_else1', Id_else2: 'Id_else2', Id_else3: 'Id_else3', Id_else4: 'Id_else4', Int: 'Int', Id_int1: 'Id_int1', Id_int2: 'Id_int2', Id_int3: 'Id_int3', Id: 'Id', GT: 'GT', GE: 'GE',

    Assignment: 'Assignment',

    Plus: 'Plus', Minus: 'Minus', Star: 'Star', Slash: 'Slash',

    SemiColon: 'SemiColon',
    LeftParen: 'LeftParen',
    RightParen: 'RightParen',

    IntLiteral: 'IntLiteral'
}

//是否是字母
const isAlpha = (ch) => {
    return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z';
}

//是否是数字
const isDigit = (ch) => {
    return ch >= '0' && ch <= '9';
}

//是否是空白字符
const isBlank = (ch) => {
    return ch == ' ' || ch == '\t' || ch == '\n';
}

/**
 * 打印所有的Token
 * @param tokens
 */
const dump = () => {
    let tokens_str = '';
    tokens_str = 
    `<table>
    <tr>
      <th>text</th>
      <th>type</th>
    </tr>
    `
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        tokens_str += 
        `<tr>
            <td>${token.text}</td>
            <td>${token.type}</td>
        </tr>`;
    }
    console.log(tokens_str);
    return tokens_str + '</table>';
}
// 获取分析结果的表格html字符串
const getCodeLexer = (code) => {
    console.log(code);
    tokens = [];
    tokenize(code);
    return dump(tokens);
}
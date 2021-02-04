/**
 * Token的类型
 */
const TokenType = {
    Plus: 'Plus',   // +
    Minus: 'Minus',  // -
    Star: 'Star',   // *
    Slash: 'Slash',  // /

    GE: 'GE',     // >=
    GT: 'GT',     // >
    EQ: 'EQ',     // ==
    LE: 'LE',    // <=
    LT: 'LT',     // <

    SemiColon: 'SemiColon', // ;
    LeftParen: 'LeftParen', // (
    RightParen: 'RightParen',// )

    Assignment: 'Assignment',// =

    If: 'If',
    Else: 'Else',
    
    Int: 'Int',

    Identifier: 'Identifier',     //标识符

    IntLiteral: 'IntLiteral',     //整型字面量
    StringLiteral: 'StringLiteral'   //字符串字面量
}

exports.TokenType = TokenType;
# 1.1 词法分析

## 概念

- 总流程：有限状态机，逐个输入字符分析，确定一个token（词法分析的词）后，保存到列表中。
- 初始状态分析（initToken方法）：确定一个token后都会回到初始状态，然后决定下一个要去的状态
- 状态分析（tokenize方法）：在每个状态中，累计字符，直到形成token。

## bug

- 最后一个token没有分析到：循环到最后一个字符时，tokenText已经形成好，但是没有后续字符使其终结此token进入initToken了，因此在输入字符循环外加入initToken方法去形成最后一个token

![Lexer](/img/Lexer.png)
![Lexer](/img/Lexer2.png)


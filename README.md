# 1.1 词法分析

- 总流程：有限状态机，逐个字符分析，确定一个token（词法分析的词）后，保存到列表中。
- 初始状态：确定一个token后都会回到初始状态，然后决定下一个要去的状态
- 状态：在每个状态中，累计字符，直到形成token。



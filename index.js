
const buttonEl = document.getElementById('lexical')
const resultEl = document.getElementById('result')
const inputEl = document.getElementById('input')
const multbuttonEl = document.getElementById('mult')
const multinputEl = document.getElementById('multinput')
const addbuttonEl = document.getElementById('add')
const addinputEl = document.getElementById('addinput')
const intbuttonEl = document.getElementById('intbutton')
const intinputEl = document.getElementById('intinput')

let tokenText = '';   //临时保存token的文本
let tokens = [];       //保存解析出来的Token数组
let token = {};        //当前正在解析的Token集合 

// 词法分析
buttonEl.addEventListener('click', run)
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault()
    run()
  }
})
function run () {
  if (!inputEl.value.trim()) return
  resultEl.innerHTML = getCodeLexer(inputEl.value)
}

// 乘法语法分析
multbuttonEl.addEventListener('click', multrun)
function multrun () {
    if (!multinputEl.value.trim()) return
    tokens = []; 
    tokenize(multinputEl.value);
    try {
        const node = multiplicative(tokens);
        console.log('node', node);
        dumpAST(node, "");
    }
    catch (e){
        console.log(e)
    }
}


// 加法语法分析（包括乘法）
addbuttonEl.addEventListener('click', addrun)
function addrun () {
    if (!addinputEl.value.trim()) return
    tokens = []; 
    tokenize(addinputEl.value);
    try {
        const node = additive(tokens);
        console.log('node', node);
        dumpAST(node, "");
    }
    catch (e){
        console.log(e)
    }
}

// 整型变量声明语法分析
intbuttonEl.addEventListener('click', intrun)
function intrun () {
    if (!intinputEl.value.trim()) return
    tokens = []; 
    tokenize(intinputEl.value);
    try {
        const node = intDeclare(tokens);
        console.log('node', node);
        dumpAST(node, "");
    }
    catch (e){
        console.log(e)
    }
}


const buttonEl = document.getElementById('lexical')
const resultEl = document.getElementById('result')
const inputEl = document.getElementById('input')
const multbuttonEl = document.getElementById('multlexical')
const multresultEl = document.getElementById('multresult')
const multinputEl = document.getElementById('multinput')

let tokenText = '';   //临时保存token的文本
let tokens = [];       //保存解析出来的Token数组
let token = {};        //当前正在解析的Token集合 

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


multbuttonEl.addEventListener('click', multrun)
function multrun () {
    if (!multinputEl.value.trim()) return
//   resultEl.innerHTML = getCodeLexer(multinputEl.value)
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

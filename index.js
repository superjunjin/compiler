
const buttonEl = document.getElementById('lexical')
const resultEl = document.getElementById('result')
const inputEl = document.getElementById('input')

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

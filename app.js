const repl = require('repl');
const { parseParser } = require('./SimpleParser');

// writer: myWriter 
const r = repl.start({ prompt: 'Simple script language! \n> ', eval: myEval });

function myEval(cmd, context, filename, callback) {
//   console.log('cmd', cmd) // 输入代码内容 
//   console.log('context', context) // 
//   console.log('filename', filename) // filename repl
//   console.log('callback', callback) 

    // if (cmd.endsWith(";")) { 
        parseParser(cmd);
        // if (verbose) {
        // strTree = SimpleParser.dumpASTParser(tree, "");
        // }
        // evaluate(tree, "");
    // }    
  callback(null, '值');
}
// 输出转为大写
// function myWriter(output) {
//   return output.toUpperCase();
// }

const repl = require('repl');
const { parseParser, evaluateParser, dumpASTParser } = require('./SimpleParser');

// writer: myWriter 
const replServer = repl.start({ prompt: 'Simple script language! \n> ', eval: myEval });

replServer.defineCommand('tree', {
    help: '输出树🌲结构',
    action(name) {
        this.clearBufferedCommand();
        if (name.trimEnd().endsWith(";")) {
            const tree = parseParser(name);  // 树结构解析
            dumpASTParser(tree, ''); // 树结构打印输出
            const result = evaluateParser(tree, "", true); // 树结构求值
            console.log(result);
        }else{
            console.log('请输入分号结尾的语句');
        }

        this.displayPrompt();
    }
});

function myEval(cmd, context, filename, callback) {
    //   console.log('cmd', cmd) // 输入代码内容 
    //   console.log('context', context) // 
    //   console.log('filename', filename) // filename repl
    //   console.log('callback', callback) 

    if (cmd.trimEnd().endsWith(";")) {
        const tree = parseParser(cmd); // 树结构解析
        const result = evaluateParser(tree, "", false); // 树结构求值
        callback(null, result);
    } else {
        callback(null, '请输入分号结尾的语句');
    }

}
// 输出转为大写
// function myWriter(output) {
//   return output.toUpperCase();
// }

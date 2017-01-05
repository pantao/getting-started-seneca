const fs = require('fs')

function math(options) {

  // 日志记录函数，通过 init 函数创建
  var log

  // 将所有模式放在一起会上我们查找更方便
  this.add('role:math,cmd:sum',     sum)
  this.add('role:math,cmd:product', product)

  // 这就是那个特殊的初始化操作
  this.add('init:math', init)

  function init(msg, respond) {
    // 将日志记录至一个特写的文件中
    fs.open(options.logfile, 'a', function (err, fd) {

      // 如果不能读取或者写入该文件，则返回错误，这会导致 Seneca 启动失败
      if (err) return respond(err)

      log = makeLog(fd)
      respond()
    })
  }

  function sum(msg, respond) {
    var out = { answer: msg.left + msg.right }
    log('sum '+msg.left+'+'+msg.right+'='+out.answer+'\n')
    respond(null, out)
  }

  function product(msg, respond) {
    var out = { answer: msg.left * msg.right }
    log('product '+msg.left+'*'+msg.right+'='+out.answer+'\n')
    respond(null, out)
  }

  function makeLog(fd) {
    return function (entry) {
      fs.write(fd, new Date().toISOString()+' '+entry, null, 'utf8', function (err) {
        if (err) return console.log(err)

        // 确保日志条目已刷新
        fs.fsync(fd, function (err) {
          if (err) return console.log(err)
        })
      })
    }
  }
}

require('seneca')()
  .use(math, {logfile:'./math.log'})
  .act('role:math,cmd:sum,left:1,right:2', console.log)

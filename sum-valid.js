const seneca = require('seneca')()

seneca
  .add(
    'role:math,cmd:sum',
    function(msg, respond) {
      var sum = msg.left + msg.right
      respond(null, {
        answer: sum
      })
    })

// 重写 role:math,cmd:sum with ，添加额外的功能
.add(
  'role:math,cmd:sum',
  function(msg, respond) {

    // bail out early if there's a problem
    if (!Number.isFinite(msg.left) ||
      !Number.isFinite(msg.right)) {
      return respond(new Error("left 与 right 值必须为数字。"))
    }

    // 调用上一个操作函数 role:math,cmd:sum
    this.prior({
      role: 'math',
      cmd: 'sum',
      left: msg.left,
      right: msg.right,

    }, function(err, result) {
      if (err) return respond(err)

      result.info = msg.left + '+' + msg.right
      respond(null, result)
    })
  })

// 增加了的 role:math,cmd:sum
.act('role:math,cmd:sum,left:1.5,right:2.5',
  console.log // 打印 { answer: 4, info: '1.5+2.5' }
)

const seneca = require('seneca')();

/**
 * `seneca.add` 方法，添加了一个新的动作模式（*Action Pattern*）至 `Seneca` 实例中，
 * 它有两个参数：
 *
 * 1. `pattern` ：用于匹配 Seneca 实例中 `JSON` 消息体的模式；
 * 2. `action` ：当模式被匹配时执行的操作
 */
seneca.add('role:math, cmd:sum', (msg, reply) => {
  reply(null, { answer: ( msg.left + msg.right )})
});

/**
 * `seneca.act` 方法同样有两个参数：
 *
 * 1. `msg` ：作为纯对象提供的待匹配的入站消息；
 * 2. `respond` ：用于接收并处理响应信息的回调函数。
 */
seneca.act({
  role: 'math',
  cmd: 'sum',
  left: 1,
  right: 2
}, (err, result) => {
  if (err) {
    return console.error(err);
  }
  console.log(result);
});

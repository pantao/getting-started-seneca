const seneca = require('seneca')();

seneca
  .add('role:math, cmd:sum', (msg, reply) => {
    reply(null, {
      answer: (msg.left + msg.right)
    })
  })
  .act({
    role: 'math',
    cmd: 'sum',
    left: 1,
    right: 2
  }, console.log)
  .act({
    role: 'math',
    cmd: 'sum',
    left: 1.5,
    right: 2.5
  }, console.log)

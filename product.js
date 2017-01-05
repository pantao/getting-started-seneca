const seneca = require('seneca')();

seneca.add('role:math, cmd:product', (msg, reply) => {
  reply(null, { answer: ( msg.left * msg.right )})
});

seneca.act({
  role: 'math',
  cmd: 'product',
  left: 3,
  right: 4
}, (err, result) => {
  if (err) {
    return console.error(err);
  }
  console.log(result);
});

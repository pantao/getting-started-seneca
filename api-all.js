module.exports = function api(options) {

  var validOps = {
    sum: 'sum',
    product: 'product'
  }

  this.add('role:api,path:calculate', function(msg, respond) {
    var operation = msg.args.params.operation
    var left = msg.args.query.left
    var right = msg.args.query.right
    this.act('role:math', {
      cmd: validOps[operation],
      left: left,
      right: right,
    }, respond)
  });

  this.add('role:api,path:store', function(msg, respond) {
    let id = null;
    if (msg.args.query.id) id = msg.args.query.id;
    if (msg.args.body.id) id = msg.args.body.id;

    const operation = msg.args.params.operation;
    const storeMsg = {
      role: 'store',
      id: id
    };
    if ('get' === operation) storeMsg.get = 'book';
    if ('purchase' === operation) storeMsg.cmd = 'purchase';

    this.act(storeMsg, respond);
  });

  this.add('init:api', function(msg, respond) {
    this.act('role:web', {
      routes: {
        prefix: '/api',
        pin: 'role:api,path:*',
        map: {
          calculate: {
            GET: true,
            suffix: '/{operation}'
          },
          store: {
            GET: true,
            POST: true,
            suffix: '/{operation}'
          }
        }
      }
    }, respond)
  })

}

const stats = {};

require('seneca')()
  .add('role:store,info:purchase', function(msg, respond) {
    const id = msg.purchase.bookId;
    stats[id] = stats[id] || 0;
    stats[id]++;
    console.log(stats);
    respond();
  })
  .listen({
    port: 9003,
    pin: 'role:store,info:purchase'
  });

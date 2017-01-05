require('seneca')()
  .use('basic')
  .use('entity')
  .use('book-store')
  .listen({
    port: 9002,
    pin: 'role:store'
  })
  .client({
    port: 9003,
    pin: 'role:store,info:purchase'
  });

require('seneca')()
  .use('math')
  .listen({type: 'tcp'})

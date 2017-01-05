require('seneca')()
  .client({type: 'tcp'})
  .act('role:math,cmd:sum,left:1,right:2',console.log)

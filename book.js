const seneca = require('seneca')();
seneca.use('basic').use('entity');

const book = seneca.make('book');
book.title = 'Action in Seneca';
book.price = 9.99;

// 发送 role:entity,cmd:save,name:book 消息
book.save$( console.log );

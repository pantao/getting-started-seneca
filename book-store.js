module.exports = function(options) {

  // 从数据库中，查询一本ID为 `msg.id` 的书，我们使用了 `load$` 方法
  this.add('role:store, get:book', function(msg, respond) {
    this.make('book').load$(msg.id, respond);
  });

  // 向数据库中添加一本书，书的数据为 `msg.data`，我们使用了 `data$` 方法
  this.add('role:store, add:book', function(msg, respond) {
    this.make('book').data$(msg.data).save$(respond);
  });

  // 创建一条新的支付订单（在真实的系统中，经常是由商品详情布中的 *购买* 按钮触
  // 发的事件），先是查询出ID为 `msg.id` 的书本，若查询出错，则直接返回错误，
  // 否则，将书本的信息复制给 `purchase` 实体，并保存该订单，然后，我们发送了
  // 一条 `role:store,info:purchase` 消息（但是，我们并不接收任何响应），
  // 这条消息只是通知整个系统，我们现在有一条新的订单产生了，但是我并不关心谁会
  // 需要它。
  this.add('role:store, cmd:purchase', function(msg, respond) {
    this.make('book').load$(msg.id, function(err, book) {
      if (err) return respond(err);

      this
        .make('purchase')
        .data$({
          when: Date.now(),
          bookId: book.id,
          title: book.title,
          price: book.price,
        })
        .save$(function(err, purchase) {
          if (err) return respond(err);

          this.act('role:store,info:purchase', {
            purchase: purchase
          });
          respond(null, purchase);
        });
    });
  });

  // 最后，我们实现了 `role:store, info:purchase` 模式，就只是简单的将信息
  // 打印出来， `seneca.log` 对象提供了 `debug`、`info`、`warn`、`error`、
  // `fatal` 方法用于打印相应级别的日志。
  this.add('role:store,info:purchase', function(msg, respond) {
    this.log.info('purchase', msg.purchase);
    respond();
  });
};

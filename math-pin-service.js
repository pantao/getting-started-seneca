require('seneca')()

  .use('math')

  // 监听 role:math 消息
  // 重要：必须匹配客户端
  .listen({ type: 'tcp', pin: 'role:math' })

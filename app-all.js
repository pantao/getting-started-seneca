const Hapi = require('hapi');
const Seneca = require('seneca');
const SenecaWeb = require('seneca-web');

const config = {
  adapter: require('seneca-web-adapter-hapi'),
  context: (() => {
    const server = new Hapi.Server();
    server.connection({
      port: 3000
    });

    server.route({
      path: '/routes',
      method: 'get',
      handler: (request, reply) => {
        const routes = server.table()[0].table.map(route => {
          return {
            path: route.path,
            method: route.method.toUpperCase(),
            description: route.settings.description,
            tags: route.settings.tags,
            vhost: route.settings.vhost,
            cors: route.settings.cors,
            jsonp: route.settings.jsonp,
          }
        })
        reply(routes)
      }
    });

    return server;
  })()
};

const seneca = Seneca()
  .use(SenecaWeb, config)
  .use('basic')
  .use('entity')
  .use('math')
  .use('api-all')
  .client({
    type: 'tcp',
    pin: 'role:math'
  })
  .client({
    port: 9002,
    pin: 'role:store'
  })
  .ready(() => {
    const server = seneca.export('web/context')();
    server.start(() => {
      server.log('server started on: ' + server.info.uri);
    });
  });

// 创建一本示例书籍
seneca.act(
  'role:store,add:book', {
    data: {
      title: 'Action in Seneca',
      price: 9.99
    }
  },
  console.log
)

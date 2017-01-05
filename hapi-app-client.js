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
  .use('api')
  .client({type: 'tcp', pin: 'role:math'})
  .ready(() => {
    const server = seneca.export('web/context')();
    server.start(() => {
      server.log('server started on: ' + server.info.uri);
    });
  });

const server = require('@mna/server')

module.exports = function(config) {

  const { appConfig, chalk } = config
  const { serve: serveConfig = {} } = appConfig
  const {
    port = 3000,
    dir = process.cwd()
  } = (serveConfig===true ? {} : serveConfig)
  const { get, send, router, serveStatic } = server

  const app = server(router([
    get('*', serveStatic(dir, { index: ['index.html'] })),
    (req, res) => send(res, 404)
  ]))

  app.listen(port)

  console.log(chalk.blue('serve'), `http://localhost:${port}`)
}

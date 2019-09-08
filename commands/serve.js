const server = require('@mna/server')

module.exports = function(config) {

  const { appConfig, chalk } = config
  const { serve: serveConfig = {} } = appConfig
  const {
    port = 3000,
    src = process.cwd(),
    dir,
  } = (serveConfig===true ? {} : serveConfig)
  const { get, send, router, serveStatic } = server
  const rootDir = dir || src // Backward compatibitliy

  const app = server(router([
    get('*', serveStatic(rootDir, { index: ['index.html'] })),
    (req, res) => send(res, 404)
  ]))

  app.listen(port)

  console.log(chalk.blue('serve'), `http://localhost:${port}`)
}

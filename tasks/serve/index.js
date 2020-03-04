const http = require('http')
const getPort = require('get-port')
const handler = require('serve-handler')
const smartWatchAndCompile = require('./smartWatchAndCompile')

module.exports = async function(config) {

  const {
    appRoot,
    appConfig = {},
    chalk,
    task,
    isDev = false,
    reloader,
    build: buildOnly = false
  } = config
  let serveConfig = task

  if (serveConfig===true) serveConfig = {}
  // Backward comptibility
  else if (serveConfig.dir) {
    serveConfig.dest = serveConfig.dir
  } else if (serveConfig.src && !serveConfig.dest) {
    serveConfig.dest = serveConfig.src
    delete serveConfig.src
  }

  const {
    src, dest,
    port = 3000
  } = serveConfig

  if (!buildOnly) {

    // https://github.com/zeit/serve-handler#options
    const handlerOptions = {
      public: dest,
      symlinks: true,
      directoryListing: true
    }

    const server = http.createServer((req, res) =>
      handler(req, res, handlerOptions)
    )

    const availablePort = await getPort({ port: getPort.makeRange(port, port + 100) })
    if (parseInt(port) !== availablePort) {
      console.log(chalk.yellow('serve'), `Port ${port} is busy..`)
    }

    server.listen(availablePort, () => {
      console.log(chalk.blue('serve'), `http://localhost:${availablePort}`)
    })
  }

  if (!src) return

  await smartWatchAndCompile({
    config, reloader, buildOnly,
    src,
    dest,
    appRoot
  })
}

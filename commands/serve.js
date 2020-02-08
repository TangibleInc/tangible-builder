const handler = require('serve-handler')
const http = require('http')

module.exports = function(config) {

  const { appConfig, chalk } = config
  const { serve: serveConfig = {} } = appConfig
  const {
    port = 3000,
    src = process.cwd(),
    dir,
  } = (serveConfig===true ? {} : serveConfig)

  const rootDir = dir || src // Backward compatibitliy

  // https://github.com/zeit/serve-handler#options
  const handlerOptions = {
    public: rootDir,
    symlinks: true,
    directoryListing: true
  }

  const server = http.createServer((req, res) =>
    handler(req, res, handlerOptions)
  )

  server.listen(port, () => {
    console.log(chalk.blue('serve'), `http://localhost:${port}`)
  })
}

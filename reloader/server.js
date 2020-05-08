const path = require('path')
const ws = require('ws')
const getPort = require('get-port')
const chalk = require('chalk')

let server
let logger

module.exports = async function liveReloadServer(options = {}) {


  const {
    port = 35729, // Port must be the same in client.js
    log = true,
    init = false, // Reload existing client connection
  } = options

  logger = (...args) => log && console.log(chalk.green('reload'), ...args)

  const availablePort = await getPort({ port: getPort.makeRange(port, port + 100) })

  if (!server) server = new ws.Server({ port: availablePort })

  let firstTime = true
  server.on('connection', () => {
    if (!firstTime) return
    logger('client connected')
    firstTime = false
    if (init) reload()
  })

  logger(`WebSocket server listening at port ${availablePort}`)

  if (options.watch) {

    // Automatically watch and trigger client reload

    const watchPath = path.join(options.watch, '**', '*.{js,css}')
    const watcher = require('../plugins/gulp-watch')
    const watchCommonOptions = require('../config/watch')

    let reloading = { js: false, css: false }

    watcher(watchPath, watchCommonOptions, ({ event, path: changedFile }) => {

      const extension = path.extname(changedFile).slice(1)

      if (['js', 'css'].indexOf(extension) < 0
        || reloading[extension]
      ) return

      reloading[extension] = true
      setTimeout(() => {
        if (extension==='css') reloadCSS()
        else reload()
        reloading[extension] = false
      }, options.watchDelay || 0)
    })
  }


  return { reload, reloadCSS, availablePort }
}

let scheduleReload

function reload() {
  clearTimeout(scheduleReload)
  scheduleReload = setTimeout(() => {
    // logger && logger()
    server && server.clients.forEach(client => {
      client.send(JSON.stringify({ reload: true }))
    })
  }, 300)
}

function reloadCSS() {
  // logger && logger('css')
  server && server.clients.forEach(client => {
    client.send(JSON.stringify({ reloadCSS: true }))
  })
}

const path = require('path')
const ws = require('ws')
const getPort = require('get-port')
const chalk = require('chalk')

let server
let logger

module.exports = async function liveReloadServer(options = {}) {

  // Port must be the same in client.js
  const { port = 35729, log = true } = options

  logger = (...args) => log && console.log(chalk.green('reload'), ...args)

  const availablePort = await getPort({ port: getPort.makeRange(port, port + 100) })

  if (!server) server = new ws.Server({ port: availablePort })

  let firstTime = true
  server.on('connection', () => {
    if (!firstTime) return
    logger('client connected')
    firstTime = false
  })

  logger(`WebSocket server listening at port ${availablePort}`)

  if (options.watch) {

    // Automatically watch and trigger client reload

    const watchPath = path.join(options.watch, '**', '*.{js,css}')
    const watcher = require('../plugins/gulp-watch')
    const watchCommonOptions = require('../config/watch')

    watcher(watchPath, watchCommonOptions, ({ event, path: changedFile }) => {

      const extension = path.extname(changedFile).slice(1)

      if (extension==='js') reload()
      else if (extension==='css') reloadCSS()
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

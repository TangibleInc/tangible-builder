const ws = require('ws')

let server
let logger

module.exports = function liveReloadServer(options = {}) {

  // Port must be the same in client.js
  const { port = 35729, chalk } = options

  logger = (...args) => console.log(chalk.green('reload'), ...args)

  if (!server) server = new ws.Server({ port })

  let firstTime = true
  server.on('connection', () => {
    if (!firstTime) return
    logger && logger('client connected')
    firstTime = false
  })

  logger('server listening')

  return { reload, reloadCSS }
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

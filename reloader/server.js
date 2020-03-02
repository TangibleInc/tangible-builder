const ws = require('ws')
const getPort = require('get-port')

let server
let logger

module.exports = async function liveReloadServer(options = {}) {

  // Port must be the same in client.js
  const { port = 35729, chalk } = options

  logger = (...args) => console.log(chalk.green('reload'), ...args)

  const availablePort = await getPort({ port: getPort.makeRange(port, port + 100) })

  if (!server) server = new ws.Server({ port: availablePort })

  let firstTime = true
  server.on('connection', () => {
    if (!firstTime) return
    logger && logger('client connected')
    firstTime = false
  })

  logger(`WebSocket server listening at port ${availablePort}`)

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

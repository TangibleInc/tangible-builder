const path = require('path')
const fsp = require('fs-extra')
const createServer = require('./server')

let clientJs
const cachedClientJsPerPort = {}

const createClient = async function(config = {}) {

  // Port must be the same in createServer
  const { port = 35729 } = config

  if (!clientJs) {
    clientJs = `<script>${
      await fsp.readFile(
        path.join(__dirname, 'client.js')
      )
    }</script>`
  }

  return cachedClientJsPerPort[ port ] = cachedClientJsPerPort[ port ]
    || clientJs.replace('%WEBSOCKET_PORT%', port)
}

const createReloader = async (options = {}) => {

  const server = await createServer(options)
  const client = await createClient({ port: server.availablePort })

  return {
    client,
    server
  }
}

module.exports = {
  createClient,
  createServer,
  createReloader
}

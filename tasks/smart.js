const serveTask = require('./serve')

module.exports = function smartTask(config) {
  return serveTask({ ...config, buildOnly: true })
}

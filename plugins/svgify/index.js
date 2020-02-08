const through = require('./through')

module.exports = function(file) {

  let buffer = ''

  if (!/\.svg$/.test(file)) {
    return through()
  } else {
    return through(function(chunk) {

      return buffer += chunk.toString()

    }, function() {

      const jst = buffer.toString()
      let	compiled = 'module.exports = '

      compiled += JSON.stringify(jst)
      compiled += ';\n'

      this.queue(compiled)
      return this.queue(null)

    })
  }
}
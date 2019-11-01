module.exports = function beautifyCommand(config) {
  require('./lint')({
    ...config,
    lintFix: true
  })
}
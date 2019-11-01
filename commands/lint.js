const path = require('path')
const run = require('../utils/runCommand')

module.exports = function lintCommand(config) {

  const {
    args,
    lintFix = false
  } = config

  const localVendorPath = path.join(__dirname, '..', 'vendor')

  const command = path.join(localVendorPath, 'bin', lintFix ? 'phpcbf' : 'phpcs')

  let options = `--colors --extensions=php --runtime-set installed_paths ${
    path.join(localVendorPath, 'wp-coding-standards', 'wpcs')
  } --standard=${
    path.join(__dirname, '..', 'config', 'phpcs.xml')
  }`

  if (args.length) {
    options += ' ' + (args.join(' '))
    // Check if file(s) specified
    const lastArg = args[args.length - 1]
    if (!lastArg || lastArg[0]==='-') {
      options += ' .'
    }
  } else {
    options += ' .'
  }

  run(`${command} ${options}`, { silent: true })
}

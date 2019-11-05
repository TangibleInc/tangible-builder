const path = require('path')
const fileExists = require('../utils/fileExists')
const run = require('../utils/runCommand')

module.exports = function lintCommand(config) {

  const {
    args,
    lintFix = false
  } = config

  let vendorPath = path.join(__dirname, '..', 'vendor')

  if (!fileExists(vendorPath)) {
    // ./vendor/tangible/builder -> .
    vendorPath = path.join(__dirname, '..', '..', '..', '..', 'vendor')
  }

  const command = path.join(vendorPath, 'bin', lintFix ? 'phpcbf' : 'phpcs')

  let options = `--colors --extensions=php --runtime-set installed_paths ${
    path.join(vendorPath, 'wp-coding-standards', 'wpcs')
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

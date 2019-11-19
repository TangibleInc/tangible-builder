const path = require('path')
const fs = require('fs')
const fileExists = require('../utils/fileExists')
const run = require('../utils/runCommand')

module.exports = function lintCommand(config) {

  const {
    args,
    lintFix = false
  } = config

  // Find vendor folder

  const moduleRootPath = fs.realpathSync(path.join(__dirname, '..'))

  // Builder installed as NPM module: tangible-builder/vendor
  let vendorPath = path.join(moduleRootPath, 'vendor')

  if (!fileExists(vendorPath)) {

    // Builder installed as Composer module: ./vendor/tangible/builder -> .
    vendorPath = path.join(moduleRootPath, '..', '..', '..', 'vendor')
  }

  if (!fileExists(vendorPath)) {
    console.log(`
Could not find vendor folder: ${vendorPath}
Run: composer install

`)
    process.exit(1)
    return
  }

  // For beautify, make sure Git repo has no uncommitted changes

  if (lintFix) {
    const gitStatus = run(`git status --porcelain`, { capture: true })
    if (gitStatus) {
      console.log(`
Git repo has uncommitted changes:
${gitStatus}

Commit before running the beautify command

`)
      process.exit(1)
    }
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

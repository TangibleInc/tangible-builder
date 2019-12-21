const path = require('path')
const fs = require('fs')
const fileExists = require('../utils/fileExists')
const run = require('../utils/runCommand')

module.exports = function lintCommand(config) {

  const {
    args,
    lintFix = false,
    chalk
  } = config

  // Find vendor folder

  const moduleRootPath = fs.realpathSync(path.join(__dirname, '..'))
  let vendorPath

  // As NPM module: tangible-builder/vendor
  if (!fileExists(vendorPath = path.join(moduleRootPath, 'vendor'))) {
    // As Composer module: ./vendor/tangible/builder -> .
    vendorPath = path.join(moduleRootPath, '..', '..', '..', 'vendor')
  }

  if (!fileExists(vendorPath)) {
    console.log(`\nCould not find vendor folder: ${vendorPath}\nRun: composer install\n`)
    process.exit(1)
    return
  }

  // For beautify, warn if Git repo has uncommitted changes
  // Unused for now, since it's too verbose when running beautify several times
  /*
  if (lintFix) {
    const gitStatus = run(`git status --porcelain`, { capture: true })
    if (gitStatus) {
      console.log(`\nGit repo has uncommitted changes: ${gitStatus}\nIt's recommended to commit before running the beautify command\n`)
      //process.exit(1)
    }
  }*/

  const builderConfigPath = path.join(__dirname, '..', 'config')

  const taskTitle = chalk.green(lintFix ? 'beautify' : 'lint')


  // PHP Code Sniffer/Fixer - @see https://github.com/squizlabs/PHP_CodeSniffer

  let command = path.join(vendorPath, 'bin', lintFix ? 'phpcbf' : 'phpcs')

  let options = `--colors --extensions=php -s --runtime-set installed_paths ${
    path.join(vendorPath, 'wp-coding-standards', 'wpcs')
  } --standard=${
    path.join(builderConfigPath, 'phpcs.xml')
  }`

  // Pass options and path
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

  command = `${command} ${options}`
  console.log(`${taskTitle} php`)

  run(command, { silent: true })


  if (lintFix) {

    // Prettier - @see https://prettier.io/

    const sources = ['js', 'ts', 'css', 'scss'].map(f => `**/**.${f}`).join(',')
    const prettierIgnorePath = path.join(builderConfigPath, '.prettierignore')

    console.log(`${taskTitle} js, ts, css, scss`)

    run(`prettier --no-semi --single-quote --write "{${sources}}" --ignore-path ${prettierIgnorePath}`, { silent: true })

  } else {

    // Stylelint - @see https://stylelint.io/

    ;['css', 'scss'].forEach(extension => {

      const stylelintConfigPath = path.join(builderConfigPath, `stylelint.${extension}.js`)

      console.log(`${taskTitle} ${extension}`)

      run(`stylelint "**/*.${extension}" --ignore-pattern "**/*.min.css" --allow-empty-input --config ${stylelintConfigPath} --fix`, { silent: true })
    })

    // TODO: ESLint for JS/TS
  }

}

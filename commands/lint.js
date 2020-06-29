const path = require('path')
const fs = require('fs')
const fileExists = require('../utils/fileExists')
const run = require('../utils/runCommand')

module.exports = function lintCommand(config) {

  const {
    args,
    chalk,
    appRoot, nodeModulesPath,
    lintFix = false,
  } = config

  // Find vendor folder

  const moduleRootPath = fs.realpathSync(path.join(__dirname, '..'))
  const moduleVendorPath = path.join(moduleRootPath, 'vendor')
  let vendorPath = moduleVendorPath

  // As NPM module: tangible-builder/vendor
  if (!fileExists(moduleVendorPath)) {
    // As Composer module: ./vendor/tangible/builder -> .
    vendorPath = path.join(moduleRootPath, '..', '..', '..', 'vendor')

    if (!fileExists(vendorPath)) {

      // TODO: Run composer install automatically in module root

      console.log(`\nCould not find vendor folder: ${path.relative(vendorPath)}\nRun: composer install\n`)
      process.exit(1)
      return
    }
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

  const prettierCommand = `${nodeModulesPath}/prettier/bin-prettier.js`
  const prettierIgnorePath = path.join(builderConfigPath, '.prettierignore')

  const stylelintCommand = `${nodeModulesPath}/stylelint/bin/stylelint.js`
  const getStylelintConfigPath = extension => path.join(builderConfigPath, `stylelint.${extension}.js`)

  // PHP Code Sniffer/Fixer - @see https://github.com/squizlabs/PHP_CodeSniffer

  let command = path.join(vendorPath, 'bin', lintFix ? 'phpcbf' : 'phpcs')

  // Show verbose progress, rule names, set paths to standards
  let options = `-v -s --colors --extensions=php --runtime-set installed_paths ${
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
  //console.log(command)

  // @see @prettier/plugin-php https://github.com/prettier/plugin-php
  //if (lintFix) run(`${prettierCommand} --single-quote --tab-width=2 --brace-style=1tbs --write "**/**.php" --ignore-path ${prettierIgnorePath}`, { silent: true })

  run(command, { silent: true })


  if (lintFix) {

    // Prettier - @see https://prettier.io/

    const sources = ['js', 'ts', 'css', 'scss'].map(f => `**/**.${f}`).join(',')

    command = `${prettierCommand} --no-semi --single-quote --write "{${sources}}" --ignore-path ${prettierIgnorePath}`

    console.log(`${taskTitle} js, ts, css, scss`)
    //console.log(command)

    run(command, { silent: true })

  } else {

    // Stylelint - @see https://stylelint.io/

    ;['css', 'scss'].forEach(extension => {

      command = `${stylelintCommand} "**/*.${extension}" --ignore-pattern "**/*.min.css" --ignore-pattern "**/vendor/**" --allow-empty-input --config ${ getStylelintConfigPath(extension) } --fix`

      console.log(`${taskTitle} ${extension}`)
      //console.log(command)

      run(command, { silent: true })
    })

    // TODO: ESLint for JS/TS
  }

}

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fileExists = require('../utils/fileExists')
const getTaskAction = require('../utils/getTaskAction')

module.exports = function createConfig() {

  const args = process.argv.slice(2)
  const appRoot = process.cwd()

  // Make sure node_modules exist
  const nodeModulesPath = path.join(appRoot, 'node_modules')
  if (!fileExists(nodeModulesPath)) {
    console.log('Please make sure to run "yarn" or "npm install" first.')
    process.exit(1)
  }

  // App config

  const appConfigPath = path.join(appRoot, 'tangible.config.js')
  let appConfig

  if (fileExists(appConfigPath)) {
    try {
      appConfig = require(appConfigPath)
    } catch(e) {
      console.error(e)
      process.exit(1)
    }
  } else {
    // Create new config file
    appConfig = { build: [] }
    fs.writeFileSync(appConfigPath,
      `module.exports = {
  build: [
    // Example:
    // {
    //   task: 'js',
    //   src: 'src/index.js',
    //   dest: 'build/app.min.js',
    //   watch: 'src/**/*.js'
    // },
    // {
    //   task: 'sass',
    //   src: 'src/index.scss',
    //   dest: 'build/app.min.css',
    //   watch: 'src/**/*.scss'
    // },
  ]
}
`
    )
    console.log(`Created new config file: ${path.relative(appRoot, appConfigPath)}`)
  }

  // Command

  const availableCommands = [
    'dev',
    'beautify',
    'build',
    'lint',
    'serve',
    'gitl',
    'help',
  ]

  const command = args[0] && availableCommands.includes(args[0])
    ? args.shift()
    : 'help'

  return {
    command, args,
    appRoot, appConfig,

    // Utilities for tasks
    chalk,
    fileExists, getTaskAction,
    toRelative: f => path.relative(appRoot, f),
  }
}
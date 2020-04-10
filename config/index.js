const fs = require('fs-extra')
const path = require('path')
const minimist = require('minimist')
const chalk = require('chalk')
const fileExists = require('../utils/fileExists')
const getTaskAction = require('../utils/getTaskAction')

const availableCommands = [
  'beautify',
  'build',
  'dev',
  'docs',
  'gitl',
  'help',
  'new',
  'lint',
  'schema',
  'serve',
]

module.exports = async function createConfig() {

  const options = minimist(process.argv.slice(2))
  const args = options._

  const appRoot = process.cwd()

  // Make sure node_modules exist
  let nodeModulesPath = path.join(appRoot, 'node_modules')

  if (!fileExists(nodeModulesPath)) {
    nodeModulesPath = path.join(__dirname, '..', 'node_modules')
    if (!fileExists(nodeModulesPath)) {
      console.log('Couldn\'t find node_modules folder. Please make sure to run "npm install" or "yarn" first.')
      process.exit(1)
    }
  }

  const packageJson = {}
  try {
    Object.assign(packageJson, await fs.readJson(path.join(appRoot, 'package.json')))
  } catch(e) {}

  // Command

  const command = args[0] && availableCommands.includes(args[0])
    ? args.shift()
    : 'help'

  const config = {
    command, args, options,

    appRoot, nodeModulesPath,

    // Utilities for tasks
    fs, chalk,
    fileExists, getTaskAction,
    toRelative: f => path.relative(appRoot, f),
  }

  // App config

  const appConfigPath = path.join(appRoot, 'tangible.config.js')
  let appConfig

  if (fileExists(appConfigPath)) {
    try {
      appConfig = require(appConfigPath)
      if (appConfig instanceof Function) {
        appConfig = await appConfig(config)
      }
    } catch(e) {
      console.error(e)
      process.exit(1)
    }
  } else {
    appConfig = {
      build: [],
      serve: {
        src: 'src',
        dest: 'build',
        port: 3000
      }
    }
  }

  Object.assign(config, { appConfig, appConfigPath, packageJson })

  return config
}
const fs = require('fs')
const path = require('path')
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
  'init',
  'lint',
  'serve',
]

module.exports = function createConfig() {

  const args = process.argv.slice(2)
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
    appConfig = { build: [] }
  }

  // Command

  const command = args[0] && availableCommands.includes(args[0])
    ? args.shift()
    : 'help'

  return {
    command, args,
    appRoot, appConfig,

    appConfigPath, nodeModulesPath,

    // Utilities for tasks
    chalk,
    fileExists, getTaskAction,
    toRelative: f => path.relative(appRoot, f),
  }
}
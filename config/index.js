const path = require('path')
const chalk = require('chalk')
const fileExists = require('../utils/fileExists')
const getTaskAction = require('../utils/getTaskAction')

module.exports = function createConfig() {

  const args = process.argv.slice(2)

  // App config

  const appRoot = process.cwd()
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
    appConfig = { notFound: true }
    args.splice(0)
    args.push('help')
  }

  // Command

  const availableCommands = [
    'dev',
    'build',
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
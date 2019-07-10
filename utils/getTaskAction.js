const path = require('path')
const fileExists = require('./fileExists')

const taskActions = {}

module.exports = function getTaskAction(taskName) {

  const taskPath = path.join(__dirname, `../tasks/${taskName}.js`)
  let taskAction = taskActions[taskPath]

  if (!taskAction) {
    if (!fileExists(taskPath)) throw `Unknown task "${taskName}"`
    taskAction = taskActions[taskPath] = require(taskPath)
  }

  return taskAction
}

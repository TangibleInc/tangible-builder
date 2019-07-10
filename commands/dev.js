const watch = require('gulp-watch')

module.exports = async function devCommand(config) {

  const { appConfig, getTaskAction } = config
  const { build: tasks = [] } = appConfig

  if (!tasks.length) throw 'No build tasks found'

  console.log('Build (development mode)\n')

  const runTaskAction = task => getTaskAction(task.task)({
    ...config, task, isDev: true
  })

  const buildPromises = tasks.map(runTaskAction)

  await Promise.all(buildPromises)

  // Watch and rebuild

  for (const task of tasks) {

    if (!task.watch) continue

    console.log('watch', task.watch)
    watch(task.watch, () => {
      runTaskAction(task).catch(console.error)
    })
  }
}

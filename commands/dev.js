const watch = require('gulp-watch')

module.exports = async function devCommand(config) {

  const { appConfig, getTaskAction, chalk } = config
  const { build: tasks = [], serve } = appConfig

  if (!tasks.length) throw 'No build tasks found'

  console.log('Build for development\n')

  // Optional: WebSocket connection to reload page on file change

  let reloader

  if (serve && serve.reload) {
    reloader = require('../reloader/server')({
      chalk
    })
  }

  const runTaskAction = task => getTaskAction(task.task)({
    ...config, task, isDev: true, reloader
  })

  const buildPromises = tasks.map(runTaskAction)

  try {
    await Promise.all(buildPromises)
  } catch(e) { /**/ }

  // Watch and rebuild

  for (const task of tasks) {

    if (!task.watch) continue

    console.log(chalk.blue('watch'), task.watch)

    // HTML task watches and individually compiles
    if (task.task==='html') continue

    const isCss = task.task==='sass'

    watch(task.watch, () => {
      runTaskAction(task)
        .then(() => {
          if (!reloader) return
          reloader[isCss ? 'reloadCSS' : 'reload']()
        })
        .catch(e => e && console.error(e.message))
    })
  }

  if (serve) require('./serve')(config)
}

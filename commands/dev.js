const path = require('path')
const watch = require('gulp-watch')

const watchCommonOptions = {
  read: false, // Only need change events, not file contents
  followSymlinks: true
}

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

    // HTML and Babel tasks watch and individually compile
    if (task.task==='html') continue
    if (task.task==='babel') {
      watch(task.watch, watchCommonOptions, (f) => {
        const src = f.history[0]
        if (!src) return // TODO: Handle remove file?
        const srcRelativeDir = path.relative(f.base, path.dirname(f.history[0]))
        const dest = path.join(task.dest, srcRelativeDir)
        runTaskAction({
          ...task,
          src, dest
        }).catch(e => e && console.error(e.message))
      })
      continue
    }

    const isCss = task.task==='sass'

    watch(task.watch, watchCommonOptions, () => {
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

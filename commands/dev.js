const path = require('path')
const watch = require('../plugins/gulp-watch')
const watchCommonOptions = require('../config/watch')

module.exports = async function devCommand(config) {

  const { appConfig, getTaskAction, chalk } = config
  const { build: tasks = [], serve } = appConfig

  if (!tasks.length && !serve) throw 'No build tasks found'

  console.log('Build for development\n')

  process.env.NODE_ENV = 'development'

  // Optional: WebSocket connection to reload page on file change
  const reloader = !serve || serve.reload===false ? false : await require('../reloader/server')({
    chalk
  })

  const runTaskAction = task => getTaskAction(task.task)({
    ...config, task, isDev: true, reloader
  })

  const buildPromises = tasks.map(async task => {
    try {
      await runTaskAction(task)
    } catch(e) {
      e && console.error(chalk.red(task.task), e.message)
    }
  })

  await Promise.all(buildPromises)

  // Watch and rebuild

  // Support terminate signal from another process, i.e., tests running concurrently
  process.on('SIGTERM', function() {
    process.exit()
  })

  for (const task of tasks) {

    if (task.task==='schema' && typeof task.watch==='undefined') {
      task.watch = true
    }

    if (!task.watch) continue
    if (task.watch===true) task.watch = task.src

    console.log(chalk.blue('watch'), chalk.green(task.task), task.watch)

    // These tasks watch and individually compile
    if (task.task==='html' || task.task==='copy') continue
    if (task.task==='babel' || task.task==='schema') {
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

  if (serve) await require('../tasks/serve')({
    ...config,
    task: serve,
    isDev: true,
    reloader
  })
}

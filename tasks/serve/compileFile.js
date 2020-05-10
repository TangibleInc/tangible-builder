const path = require('path')

module.exports = async function compileFile({ config, srcFile, destFile, rootDirs, tasks, reloader }) {

  const {
    appRoot,
    appConfig = {},
    chalk,
    isDev,
  } = config

  const {
    js: jsConfig,
    sass: sassConfig,
    html: htmlConfig
  } = appConfig.serve || {}

  const task = {
    src: srcFile,
    dest: destFile,
    root: rootDirs
  }

  const taskConfig = {
    ...config,
    task,
    isDev,
    reloader
  }

  const ext = path.extname(srcFile).slice(1)
  let taskName

  const mergeTask =  (cfg) => !cfg ? task : ({
    ...task,
    ...cfg,
    root: [
      ...(task.root || []),
      ...(cfg.root || [])
    ]
  })

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      taskName = 'js'
      taskConfig.task = mergeTask(jsConfig)
      break
    case 'scss':
      taskName = 'sass'
      taskConfig.task = mergeTask(sassConfig)
      break
    case 'html':
      taskName = 'html'
      taskConfig.task = mergeTask(htmlConfig)
      break
    default:
      console.log(chalk.red('serve'), `Unknown file type ${path.relative(appRoot, srcFile)}`)
      return
  }

  try {
    await tasks[taskName](taskConfig)
  } catch(e) {
    e && console.error(chalk.red(taskName), e.message)
  }
}
const path = require('path')

module.exports = async function compileFile({ config, srcFile, destFile, rootDirs, tasks, reloader }) {

  const { appRoot, chalk, isDev } = config

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

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      taskName = 'js'
      break
    case 'scss':
      taskName = 'sass'
      break
    case 'html':
      taskName = 'html'
      break
    default:
      console.log(chalk.red('serve'), `Unknown file type ${path.relative(appRoot, srcFile)}`)
      return
    }
  try {
    await tasks[taskName](taskConfig)
  } catch(e) {
    // console.error(chalk.red(taskName), e.message)
  }

}
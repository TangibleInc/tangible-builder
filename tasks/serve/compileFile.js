const path = require('path')

module.exports = async function compileFile({ config, srcFile, destFile, tasks, reloader }) {

  const { appRoot, chalk, isDev } = config

  const task = {
    src: srcFile,
    dest: destFile
  }
  const taskConfig = {
    ...config,
    task,
    isDev,
    reloader
  }

  const ext = path.extname(srcFile).slice(1)

  switch (ext) {
  case 'js':
  case 'jsx':
  case 'ts':
  case 'tsx':
    await tasks.js(taskConfig)
    break
  case 'scss':
    await tasks.sass(taskConfig)
    break
  case 'html':
    await tasks.html(taskConfig)
    break
  default:
    console.log(chalk.red('serve'), `Unknown file type ${path.relative(appRoot, srcFile)}`)
    return
  }
}
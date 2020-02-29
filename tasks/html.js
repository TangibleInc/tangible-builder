const path = require('path')
const glob = require('glob')
const watcher = require('gulp-watch')
const htmlProcessor = require('../plugins/html-processor')
const fsp = require('fs-extra')
const watchCommonOptions = require('../config/watch')

module.exports = async function htmlTask(config) {

  const {
    task: {
      src,
      dest: destDir = config.task.destDir || 'build', // Alias and default
      watch,
      root: rootDirs = [],
      templateData = {}
    },
    reloader = false,
    isDev = false,
    toRelative, chalk, fileExists,
  } = config

  const files = await new Promise((resolve, reject) => {
    glob(src, {}, function (err, files) {
      if (err) return reject(err)
      return resolve(files)
    })
  })

  if (!files.length) {
    console.log('No matching files found for source', src)
    return
  }

  const compileProps = {
    srcBaseDir: config.srcBaseDir || src.split('/')[0] || 'src',
    destDir,
    chalk,
    toRelative,
    templateData,
    reloader
  }

  const handleError = e => console.log(chalk.red('html'), e.message)

  for (const srcFile of files) {
    try {
      await compileHtml({ srcFile, ...compileProps })
    } catch(e) {
      handleError(e)
    }
  }

  if (!isDev || !watch) return

  const watchEvents = ['change', 'add']

  watcher(watch, watchCommonOptions, ({ event, history }) => {

    if (watchEvents.indexOf(event) < 0) return

    compileHtml({ srcFile: history[0], ...compileProps })
      .then(() => {
        if (!reloader) return
        reloader.reload()
      })
      .catch(handleError)
  })
}

async function compileHtml({ srcFile, srcBaseDir, destDir, chalk, toRelative, templateData = {}, reloader }) {

  const thisSrcFile = toRelative(srcFile)
  const srcFileName = thisSrcFile.slice(srcBaseDir.length+1)
  const destFile = destDir.indexOf('.')>0 ? destDir : destDir + '/' + srcFileName

  const srcString = await fsp.readFile(srcFile, 'utf8')

  let result = await htmlProcessor.render(srcString, templateData, {
    filename: srcFile,
    root: path.resolve(srcBaseDir)
  })

  if (reloader) {
    const reloaderClient = `<script>${
      await fsp.readFile(
        path.join(__dirname, '..', 'reloader', 'client.js')
      )
    }</script>`
    if (result.indexOf('</body>') >= 0) {
      result = result.replace('</body>', reloaderClient+'</body>')
    } else {
      result += reloaderClient
    }
  }

  await fsp.ensureFile(destFile) // Create any directories needed
  await fsp.writeFile(destFile, result)

  console.log(chalk.green('html'), `${toRelative(thisSrcFile)} -> ${toRelative(destFile)}`)
}

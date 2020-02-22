const path = require('path')
const glob = require('glob')
const watcher = require('gulp-watch')
const ejs = require('ejs')
const fsp = require('fs-extra')

module.exports = async function htmlTask(config) {

  const {
    task: {
      src,
      dest: destDir,
      watch,
      root: rootDirs = []
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

  const templateData = {}
  const compileProps = {
    srcBaseDir: config.srcBaseDir || src.split('/')[0] || 'src',
    destDir,
    chalk,
    toRelative,
    templateData,
    reloader
  }

  for (const srcFile of files) {
    await compileHtml({ srcFile, ...compileProps })
  }

  if (!isDev || !watch) return

  const watchEvents = ['change', 'add']

  watcher(watch, ({ event, history }) => {

    if (watchEvents.indexOf(event) < 0) return

    compileHtml({ srcFile: history[0], ...compileProps })
      .then(() => {
        if (!reloader) return
        reloader.reload()
      })
      .catch(e => {
        console.log(chalk.red('html', e.message))
      })
  })
}

async function compileHtml({ srcFile, srcBaseDir, destDir, chalk, toRelative, templateData = {}, reloader }) {

  const thisSrcFile = toRelative(srcFile)
  const srcFileName = thisSrcFile.slice(srcBaseDir.length+1)
  const destFile = destDir.indexOf('.')>0 ? destDir : destDir + '/' + srcFileName

  const srcString = await fsp.readFile(srcFile, 'utf8')

  let result = ejs.render(srcString, templateData)

  if (reloader) {
    const reloaderClient = await fsp.readFile(
      path.join(__dirname, '..', 'reloader', 'client.js')
    )
    result = result.replace('</body>', `<script>${reloaderClient}</script>`)
  }

  await fsp.writeFile(destFile, result)

  console.log(chalk.green('html'), `${toRelative(thisSrcFile)} -> ${toRelative(destFile)}`)
}
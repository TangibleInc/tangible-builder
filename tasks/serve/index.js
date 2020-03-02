const path = require('path')
const http = require('http')
const getPort = require('get-port')
const handler = require('serve-handler')
const glob = require('glob')

module.exports = async function(config) {

  const { appRoot, appConfig = {}, chalk, task, isDev, reloader } = config
  let serveConfig = task

  if (serveConfig===true) serveConfig = {}
  // Backward comptibility
  else if (serveConfig.dir) {
    serveConfig.dest = serveConfig.dir
  } else if (serveConfig.src && !serveConfig.dest) {
    serveConfig.dest = serveConfig.src
    delete serveConfig.src
  }

  const {
    src, dest,
    port = 3000
  } = serveConfig

  // https://github.com/zeit/serve-handler#options
  const handlerOptions = {
    public: dest,
    symlinks: true,
    directoryListing: true
  }

  const server = http.createServer((req, res) =>
    handler(req, res, handlerOptions)
  )

  const availablePort = await getPort({ port: getPort.makeRange(port, port + 100) })
  if (parseInt(port) !== availablePort) {
    console.log(chalk.yellow('serve'), `Port ${port} is busy..`)
  }

  server.listen(availablePort, () => {
    console.log(chalk.blue('serve'), `http://localhost:${availablePort}`)
  })

  if (!src) return

  // Smart watch and compile - Every folder with index.html

  const srcFullPath = path.resolve(src)
  const destFullPath = path.resolve(dest)

  const watch = path.join(src, '**', '*.{html,js,jsx,ts,tsx,scss}')
  const watchEvents = ['change', 'add']
  const watcher = require('../../plugins/gulp-watch')
  const watchCommonOptions = require('../../config/watch')

  const tasks = {
    js: require('../js'),
    sass: require('../sass'),
    html: require('../html'),
  }

  let initialRun = true
  const foldersWithIndex = {
    // extension: { folder: true, ... }
  }

  const w = watcher(watch, { ...watchCommonOptions, ignoreInitial: false }, ({ event, path: srcFile }) => {

    if (watchEvents.indexOf(event) < 0) return

    const srcExtension = path.extname(srcFile).slice(1)
    const srcBase = path.basename(srcFile).replace(`.${srcExtension}`, '')
    const srcFileDir = path.dirname(srcFile)
    const srcFileRelative = path.relative(appRoot, srcFile)

    if (srcBase!=='index') {

      if (initialRun) return
      // Find closest folder with index.{extension}

      const relativeSrcFileDir = path.relative(srcFullPath, srcFileDir)
      const dirParts = relativeSrcFileDir.split('/')

      let indexSrcFile
      do {
        const checkDir = path.join(srcFullPath, path.join(...dirParts))
        if (foldersWithIndex[srcExtension]
          && foldersWithIndex[srcExtension][checkDir]
          && foldersWithIndex.html[checkDir] // Must contain index.html
        ) {
          indexSrcFile = path.join(checkDir, `index.${srcExtension}`)
          console.log(chalk.blue('serve'), `index of ${srcFileRelative}`, '->', path.relative(appRoot, indexSrcFile))
        }
        dirParts.pop()
      } while (dirParts.length)

      if (!indexSrcFile) {
        console.log(chalk.red('serve'), `Couldn't find destination for ${srcFileRelative}`)
        return
      }

      srcFile = indexSrcFile

    } else {
      if (!foldersWithIndex[srcExtension]) {
        foldersWithIndex[srcExtension] = {}
      }
      foldersWithIndex[srcExtension][ srcFileDir ] = true
    }

    const destFile = srcFile
      .replace(srcFullPath, destFullPath)
      .replace(`.${srcExtension}`, `.${
        srcExtension==='html' ? 'html'
          : srcExtension==='scss' ? 'min.css'
            : 'min.js'
      }`)

    if (destFile===srcFile) {
      console.log(chalk.red('serve'), `Couldn't find destination for ${srcFileRelative}`)
      return
    }

    compileFile({ config, srcFile, destFile, tasks, reloader })
      .then(() => {
        const isCss = srcExtension==='scss'
        reloader[isCss ? 'reloadCSS' : 'reload']()
      })
  })

  // Since ignoreInitial is false, 'ready' action fires too early. 'raw' happens on first changed file
  w.on('raw', e => {
    if (!isDev) process.exit()
    initialRun = false
  })
}

async function compileFile({ config, srcFile, destFile, tasks, reloader }) {

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
    console.log(chalk.green('serve'), `Unknown file type ${path.relative(appRoot, srcFile)}`)
    return
  }
}
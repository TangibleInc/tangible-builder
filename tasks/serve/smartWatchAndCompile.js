const path = require('path')
const glob = require('glob')
const compileFile = require('./compileFile')

module.exports = async function smartWatchAndCompile({
  config, reloader, buildOnly,
  src,
  dest,
  appRoot
}) {

  // Watch every folder with index.html

  const srcFullPath = path.resolve(src)
  const destFullPath = path.resolve(dest)
  const knownExtensions = 'html,js,jsx,ts,tsx,scss'

  const watch = path.join(src, '**', '*.{'+knownExtensions+'}')
  const watchEvents = ['change', 'add']
  const watcher = require('../../plugins/gulp-watch')
  const watchCommonOptions = require('../../config/watch')

  const tasks = {
    js: require('../js'),
    sass: require('../sass'),
    html: require('../html'),
  }

  let initialRun = true

  // Find all index.html at the start - watcher can add new
  // These will be considered "page folders"
  const allIndexHtml = glob.sync(path.join(src, '**', 'index.html'))
  const foldersWithIndex = {

    html: allIndexHtml.reduce((obj, key) => {
      obj[ path.resolve(path.dirname(key)) ] = true
      return obj
    }, {})

    // extension: { folder: true, ... }
  }

  const watchProps = {
    config, tasks, reloader,
    appRoot,
    srcFullPath,
    destFullPath,
    watchEvents,
    foldersWithIndex
  }

  if (buildOnly) {
    const indexFiles = []
    for (const pageFolder of Object.keys(foldersWithIndex.html)) {
      indexFiles.push(...glob.sync(path.join(pageFolder, 'index.{'+knownExtensions+'}')))
    }

    await Promise.all(indexFiles.map(f => compileOnWatch({
      event: 'add',
      path: f,
      ...watchProps,
      initialRun: true
    })))
    return
  }

  watcher(watch, { ...watchCommonOptions, ignoreInitial: false }, ({ event, path }) => compileOnWatch({
    event, path,
    ...watchProps,
    initialRun
  }))
    // Since ignoreInitial is false, 'ready' action fires too early. 'raw' happens on first changed file
    .on('raw', e => {
      initialRun = false
    })

}

function compileOnWatch({
  event,
  path: srcFile,
  initialRun,

  config, tasks, reloader,
  appRoot,
  srcFullPath,
  destFullPath,
  watchEvents,
  foldersWithIndex
}) {

  if (watchEvents.indexOf(event) < 0) return

  const { chalk } = config

  const srcExtension = path.extname(srcFile).slice(1)
  const srcBase = path.basename(srcFile).replace(`.${srcExtension}`, '')
  const srcFileDir = path.dirname(srcFile)
  const srcFileRelative = path.relative(appRoot, srcFile)

  if (srcBase==='index' && (srcExtension==='html' || foldersWithIndex.html[ srcFileDir ])) {

    if (!foldersWithIndex[srcExtension]) {
      foldersWithIndex[srcExtension] = {}
    }
    foldersWithIndex[srcExtension][ srcFileDir ] = true

  } else {

    if (initialRun) return

    // Find closest page folder with index.{extension}

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

        console.log(chalk.blue(event), srcFileRelative)
        // console.log(chalk.blue('serve'), `index of ${srcFileRelative}`, '->', path.relative(appRoot, indexSrcFile))
      }

      // Check source root once
      if (dirParts.length===1 && dirParts[0]!=='.') dirParts.unshift('.')

      dirParts.pop()

    } while (dirParts.length)

    if (!indexSrcFile) {
      console.log(chalk.red('serve'), `Couldn't find parent folder with index.html for ${srcFileRelative}`)
      return
    }

    srcFile = indexSrcFile
  }

  // const pageName = path.relative(srcFullPath, srcFile).split('/').slice(0, -1).join('.')
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

  return compileFile({ config, srcFile, destFile, tasks, reloader })
    .then(() => {
      const isCss = srcExtension==='scss'
      reloader && reloader[isCss ? 'reloadCSS' : 'reload']()
    })
}

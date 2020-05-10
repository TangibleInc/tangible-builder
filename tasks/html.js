const path = require('path')
const glob = require('glob')
const watcher = require('../plugins/gulp-watch')
const htmlProcessor = require('../plugins/html-processor')
const fsx = require('fs-extra')
const watchCommonOptions = require('../config/watch')
const { createClient: createReloaderClient } = require('../reloader')

const babel = require('@babel/core')
const createBabelConfig = require('../config/babel')
const ReactHtml = require('../plugins/html-processor/ReactHtml')

module.exports = async function htmlTask(config) {

  // Backward compatibility
  if (config.dest || config.destFolder) {
    config.destFolder = config.dest || config.destDir
  }

  const {
    task: {
      src,
      destFolder = 'build', // Alias and default
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

  const handleError = e => console.log(chalk.red('html'), e.message)

  // Transpile EJS templates

  const babelConfig = createBabelConfig({
    ...config,
    task: {
      ...config.task,
      react: 'ReactHtml', // JSX pragma
    },
    isServer: true
  })

  // No strict mode, since templates use with() construct
  babelConfig.sourceType = 'script'

  const process = ({ filename = '', src, callback }) => {
    babel.transform(src, {
      filename,
      ...babelConfig
    }, function(err, result) {
      if (err) {
        handleError(err)
        return
      }
      callback(result.code)
    })
  }

  const compileProps = {
    srcBaseDir: config.srcBaseDir || src.split('/')[0] || 'src',
    destFolder,
    chalk,
    toRelative,
    templateData,
    reloader,
    process
  }

  for (const srcFile of files) {
    try {
      await compileHtml({ srcFile, ...compileProps })
    } catch(e) {
      handleError(e)
    }
  }

  if (!isDev || !watch) return

  // Watch

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

async function compileHtml({
  srcFile,
  srcBaseDir,
  destFolder,
  chalk,
  toRelative,
  templateData = {},
  reloader,
  process
}) {

  const srcFolder = path.dirname(srcFile)
  const thisSrcFile = toRelative(srcFile)
  const srcFileName = thisSrcFile.slice(srcBaseDir.length+1)
  const destFile = destFolder.indexOf('.')>0 ? destFolder : destFolder + '/' + srcFileName

  const srcString = await fsx.readFile(srcFile, 'utf8')

  let result = await htmlProcessor.render(srcString, {

    // Constants and utilities for templates

    __file: srcFile,
    __dirname: srcFolder,
    ReactHtml,
    path,
    glob,
    fs: fsx,
    require(f) {
      return require(f[0]==='.' ? path.join(path.dirname(srcFolder, f)) : f)
    },
    local: {},

    ...templateData
  }, {
    filename: srcFile,
    root: path.resolve(srcBaseDir),
    process
  })

  if (reloader) {

    const reloaderClient = await createReloaderClient({ port: reloader.availablePort })

    if (result.indexOf('</body>') >= 0) {
      result = result.replace('</body>', reloaderClient+'</body>')
    } else {
      result += reloaderClient
    }
  }

  await fsx.ensureFile(destFile) // Create any directories needed
  await fsx.writeFile(destFile, result)

  console.log(chalk.green('html'), `${toRelative(thisSrcFile)} -> ${toRelative(destFile)}`)
}

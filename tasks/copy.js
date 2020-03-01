const path = require('path')
const gulp = require('gulp')
const watcher = require('../plugins/gulp-watch')
const fs = require('fs-extra')
const watchCommonOptions = require('../config/watch')

module.exports = function copyTask(config) {

  const {
    task: { src, dest: destDir, watch },
    isDev = false,
    toRelative, chalk, fileExists,
  } = config

  const srcDir = path.dirname(src.replace('/**', ''))
  const srcDirFullPath = path.resolve(srcDir)
  const destDirFullPath = path.resolve(destDir)

  const p = new Promise((resolve, reject) => {

    return gulp.src(src, {
      allowEmpty: true
    })
      .pipe(gulp.dest(destDir))
      .on('error', function(e) {
        if (e.message) console.error(chalk.red('copy'), e.message)
        this.emit('end')
        reject()
      })
      .on('end', () => {
        console.log(chalk.green('copy'), `${toRelative(src)} -> ${toRelative(destDir)}`)
        resolve()
      })
  })

  if (!isDev || !watch) return p

  const watchEvents = ['change', 'add']

  watcher(watch || src, watchCommonOptions, ({ event, history }) => {

    if (watchEvents.indexOf(event) < 0) return
    const src = history[0] // Full path
    const dest = src.replace(srcDirFullPath, destDirFullPath)

    if (src===dest) return // Just in case

    fs.copyFile(src, dest)
      .then(() => console.log(chalk.green('copy'), `${toRelative(src)} -> ${toRelative(dest)}`))
      .catch(e => console.log(chalk.red('copy'), e.message))
  })

  return p
}

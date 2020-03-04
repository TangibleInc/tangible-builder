const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const createBabelConfig = require('../config/babel')

module.exports = function babelTask(config) {

  const {
    task: { src, dest, root: rootDirs = [] },
    isDev = false,
    toRelative, chalk, fileExists,
  } = config

  const babelConfig = createBabelConfig(config)
  const extensions = ['.js', '.jsx', '.ts', '.tsx']

  return new Promise((resolve, reject) => {
    return gulp.src(src, {
      read: true,
      allowEmpty: true
    })
      .pipe(babel(babelConfig))
      .on('error', function(e) {
        if (e.message) console.error(chalk.red('babel'), e.message)
        this.emit('end')
        reject()
      })
      .on('end', () => {
        console.log(chalk.green('babel'), `${toRelative(src)} -> ${toRelative(dest)}`)
        resolve()
      })
      .pipe(gulp.dest(dest))
  })
}

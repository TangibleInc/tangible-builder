const path = require('path')
const gulp = require('gulp')
const browserify = require('gulp-bro')
const rename = require('gulp-rename')
const babelify = require('babelify')
const uglify = require('gulp-uglify')
const $if = require('gulp-if')

const createBabelConfig = require('../config/babel')

module.exports = function jsTask(config) {

  const {
    task: { src, dest },
    isDev = false,
    toRelative, chalk, fileExists,
  } = config

  const srcDir = path.dirname(src)
  const destDir = path.dirname(dest)
  const destFile = path.basename(dest)

  if (!fileExists(src)) {
    console.error('js', `File doesn't exist: ${src}`)
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {

    return gulp.src(src, {
      read: false, // recommended option for gulp-bro
      allowEmpty: true
    })
      .pipe(browserify({
        debug: isDev, // Source maps
        transform: [
          [babelify.configure(createBabelConfig(config)), {}]
        ],
        // Resolve require paths
        paths: [ path.resolve(srcDir) ]
      }))
      .pipe($if(!isDev, uglify()))
      .pipe(rename(destFile))
      .pipe(gulp.dest(destDir))
      .on('error', function(e) {
        console.error('js', e)
        this.emit('end')
        reject()
      })
      .on('end', () => {
        console.log('js', `${toRelative(src)} -> ${chalk.green(toRelative(dest))}`)
        resolve()
      })
  })
}

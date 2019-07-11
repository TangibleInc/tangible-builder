const path = require('path')
const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const minifyCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const $if = require('gulp-if')

const browsersList = require('../config/browsers')
const fileExists = require('../utils/fileExists')

module.exports = function sassTask({
  task: { src, dest },
  appRoot,
  isDev = false,
  toRelative, chalk
}) {

  const srcDir = path.dirname(src)
  const destDir = path.dirname(dest)
  const destFile = path.basename(dest)

  if (!fileExists(src)) {
    console.error(chalk.red('sass'), `File doesn't exist: ${src}`)
    return Promise.reject()
  }

  return new Promise((resolve, reject) => {

    gulp.src(src, {
      allowEmpty: true
    })
      .pipe($if(isDev, sourcemaps.init()))
      .pipe(sass({
        keepSpecialComments: false,
        // Resolve require paths
        includePaths: [
          srcDir,
          path.join(appRoot, 'node_modules')
        ],
        processImport: false
      }))
      .on('error', function(e) {
        if (e.message) console.error('sass', e.message)
        this.emit('end')
        reject()
      })
      .pipe(autoprefixer({
        overrideBrowserslist: browsersList,
        cascade: false
      }))
      .pipe($if(!isDev, minifyCSS()))
      .pipe(rename(destFile))
      .pipe($if(isDev, sourcemaps.write()))
      .pipe(gulp.dest(destDir))
      .on('end', function() {
        console.log(chalk.green('sass'), `${toRelative(src)} -> ${toRelative(dest)}`)
        resolve()
      })
  })
}

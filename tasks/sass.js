const path = require('path')
const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const minifyCSS = require('gulp-clean-css')
const inlineBase64 = require('../plugins/gulp-inline-base64')
const autoprefixer = require('gulp-autoprefixer')
const $if = require('gulp-if')

const browsersList = require('../config/browsers')
const fileExists = require('../utils/fileExists')

module.exports = function sassTask({
  task: {
    src,
    dest,
    root: rootDirs = [],
    map = true
  },
  appRoot,
  isDev = false,
  toRelative, chalk
}) {

  const srcDir = path.dirname(src)
  const destDir = path.dirname(dest)
  const destFile = path.basename(dest)
  const srcRelativeToDest = path.relative(destDir, srcDir)

  if (!fileExists(src)) {
    console.error(chalk.red('sass'), `File doesn't exist: ${src}`)
    return Promise.reject()
  }

  return new Promise((resolve, reject) => {

    let hasError

    gulp.src(src, {
      allowEmpty: true,
      resolveSymlinks: true,
      follow: true
    })
      .pipe($if(isDev || map, sourcemaps.init()))
      .pipe(sass({
        keepSpecialComments: false,
        // Resolve require paths
        includePaths: [
          srcDir,
          path.join(appRoot, 'node_modules'),
          ...(typeof rootDirs==='string' ? [rootDirs] : rootDirs)
        ],
        processImport: false
      }))
      .on('error', function(e) {
        if (e.message) console.error(chalk.red('sass'), e.message)
        hasError = true
        this.emit('end')
        reject()
      })
      .pipe(inlineBase64({
        baseDir: srcDir,
        useRelativePath: true,
        maxSize: 14 * 1024, // ~14kb
        // debug: isDev,
      }))
      .pipe(autoprefixer({
        overrideBrowserslist: browsersList,
        cascade: false
      }))
      .pipe($if(!isDev, minifyCSS()))
      .pipe(rename(destFile))
      .pipe($if(isDev || map, sourcemaps.mapSources(function(sourcePath, file) {
        return path.join(srcRelativeToDest, sourcePath)
      })))
      .pipe($if(isDev || map, sourcemaps.write( isDev ? undefined : '.' )))
      .pipe(gulp.dest(destDir))
      .on('end', function() {
        if (hasError) return
        console.log(chalk.green('sass'), `${toRelative(src)} -> ${toRelative(dest)}`)
        resolve()
      })
  })
}

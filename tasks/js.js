const path = require('path')
const gulp = require('gulp')
const browserify = require('gulp-bro')
const rename = require('gulp-rename')
const babelify = require('babelify')
const uglify = require('gulp-uglify')
const $if = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')

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
  const srcRelativeToDest = path.relative(destDir, srcDir)

  if (!fileExists(src)) {
    console.error(chalk.red('js'), `File doesn't exist: ${src}`)
    return Promise.resolve()
  }

  let includedNodeModulesPath = path.join(__dirname, '..', 'node_modules')
  if (!fileExists(includedNodeModulesPath)) {
    includedNodeModulesPath = path.join(__dirname, '..', '..')
  }

  const babelConfig = {
    ...createBabelConfig(config),
    sourceMaps: isDev ? 'inline' : false
  }

  return new Promise((resolve, reject) => {

    return gulp.src(src, {
      read: false, // recommended option for gulp-bro
      allowEmpty: true
    })
      .pipe(browserify({
        debug: isDev, // Source maps
        transform: [
          [babelify.configure(babelConfig), {}]
        ],
        // Resolve require paths
        paths: [ path.resolve(srcDir), includedNodeModulesPath ]
      }))
      .pipe($if(isDev, sourcemaps.init({ loadMaps: true })))
      .pipe($if(isDev, sourcemaps.mapSources(function(sourcePath, file) {
        //return '../src/' + sourcePath
        return path.join(srcRelativeToDest, sourcePath)
      })))
      .pipe($if(!isDev, uglify()))
      .pipe(rename(destFile))
      .pipe($if(isDev, sourcemaps.write('./')))
      .pipe(gulp.dest(destDir))
      .on('error', function(e) {
        if (e.message) console.error('js', e.message)
        this.emit('end')
        reject()
      })
      .on('end', () => {
        console.log(chalk.green('js'), `${toRelative(src)} -> ${toRelative(dest)}`)
        resolve()
      })
  })
}

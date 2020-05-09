const path = require('path')
const gulp = require('gulp')
const browserify = require('gulp-bro')
const rename = require('gulp-rename')
const babelify = require('babelify')
const terser = require('gulp-terser');
const $if = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')

const svgify = require('../plugins/svgify')
const createBabelConfig = require('../config/babel')

module.exports = function jsTask(config) {

  const {
    appRoot,
    task: { src, dest },
    isDev = false,
    toRelative, chalk, fileExists,
  } = config

  let {
    task: { root: rootDirs = [] }
  } = config

  if (typeof rootDirs==='string') rootDirs = [rootDirs]

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

  const babelConfig = createBabelConfig(config)
  const extensions = ['.js', '.jsx', '.ts', '.tsx']

  return new Promise((resolve, reject) => {

    let hasError

    return gulp.src(src, {
      read: false, // recommended option for gulp-bro
      allowEmpty: true,
      resolveSymlinks: true,
      follow: true
    })
      .pipe(browserify({
        debug: isDev, // Source maps
        error: 'emit',
        extensions,
        transform: [
          [babelify.configure(babelConfig), { extensions }],
          svgify
        ],
        basedir: rootDirs.length ? rootDirs[0] : srcDir,
        // Resolve require paths
        paths: [
          path.resolve(srcDir),
          ...rootDirs.map(f => path.resolve(f)),
          includedNodeModulesPath,
          path.join(appRoot, 'node_modules')
        ]
      }))
      .on('error', function(e) {
        if (e.message) console.error(chalk.red('js'), e.message)
        hasError = true
        this.emit('end')
        reject(e)
      })
      .pipe($if(isDev, sourcemaps.init({ loadMaps: true })))
      .pipe($if(isDev, sourcemaps.mapSources(function(sourcePath, file) {
        return path.join(srcRelativeToDest, sourcePath)
      })))
      .pipe($if(!isDev, terser()))
      .pipe(rename(destFile))
      .pipe($if(isDev, sourcemaps.write()))
      .pipe(gulp.dest(destDir))
      .on('end', () => {
        if (hasError) return
        console.log(chalk.green('js'), `${toRelative(src)} -> ${toRelative(dest)}`)
        resolve()
      })
  })
}

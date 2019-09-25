// Based on: https://github.com/uniteddomainsus/gulp-inline-base64
// Forked because NPM package has old source
// Also improved log to fit with Tangible Builder

const es = require('event-stream')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const mime = require('mime')

module.exports = function(opts) {

  opts = opts ||  {}

  if (!opts.baseDir) opts.baseDir = path.dirname(module.parent.filename)

  const datauri = function(file, callback) {
    let app_path = opts.baseDir
    const reg_exp = /url\([ '"]?(.*?)[ '"]?(|\,(.*?))\)/g
    const isStream = file.contents && typeof file.contents.on === 'function' && typeof file.contents.pipe === 'function'
    const isBuffer = file.contents instanceof Buffer
    if(opts.useRelativePath){
      app_path = file.path.replace(/\/[^/]+$/, '/')
    }
    if (isBuffer) {

      const matches = []
      let str = String(file.contents)
      let found, force

      while (found = reg_exp.exec(str)) {
        matches.push({
          'txt': found[0],
          'url': found[1],
          'force': found[2].replace(/(\,|\ )/g, '') == 'true' ? true : false
        })
      }

      for (let i = 0, len = matches.length; i < len; i++) {
        if (matches[i].url.indexOf('data:image') === -1) { //if find -> image already decoded
          const filepath = app_path + path.normalize(matches[i].url)
          if (fs.existsSync(filepath)) {
            const size = fs.statSync(filepath).size

            // File will not be included because of its size
            if (opts.maxSize && size > opts.maxSize && !matches[i].force) {
              if (opts.debug) console.log(chalk.green('sass'), 'gulp-inline-base64:', chalk.yellow('file is greater than ' + Math.round(size / 1024) + 'Kb > ' + Math.round(opts.maxSize / 1024) + 'kb => skip') + chalk.gray(' (' + path.relative(app_path, filepath) + ')'))
              str = str.replace(matches[i].txt, 'url(' + matches[i].url + ')')
            }

            // Else replace by inline base64 version
            else {
              const b = fs.readFileSync(filepath)
              str = str.replace(matches[i].txt, 'url(' + ('data:' + mime.getType(filepath) + ';base64,' + b.toString('base64')) + ')')
            }

          } else {
            if (opts.debug) console.log(chalk.green('sass'), 'gulp-inline-base64:', chalk.yellow('file not found => skip') + chalk.gray(' (' + path.relative(app_path, filepath) + ')'))
          }
        }
      }
      file.contents = Buffer.from(str)

      return callback(null, file)
    }

    callback(null, file)
  }

  return es.map(datauri)
}

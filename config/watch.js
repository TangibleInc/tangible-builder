/**
 * Common options for file watcher
 * @see https://github.com/paulmillr/chokidar#api
 * @see https://github.com/floatdrop/gulp-watch
 */
module.exports = {
  read: false, // Only need change events, not file contents
  followSymlinks: true
}

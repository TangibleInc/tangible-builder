module.exports = {
  build: [
    {
      task: 'js',
      src: 'assets/src/index.js',
      dest: 'assets/build/<%- projectNameKebabCase %>.min.js',
      watch: 'assets/src/**/*.js'
    },
    {
      task: 'sass',
      src: 'assets/src/index.scss',
      dest: 'assets/build/<%- projectNameKebabCase %>.min.css',
      watch: 'assets/src/**/*.scss'
    },
  ]
}
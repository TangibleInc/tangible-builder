module.exports = {
  build: [
    {
      task: 'js',
      src: 'src/index.js',
      dest: 'build/app.min.js',
      watch: 'src/**/*.js',
      react: 'wp.element'
    },
    {
      task: 'sass',
      src: 'src/index.scss',
      dest: 'build/app.min.css',
      watch: 'src/**/*.scss'
    },
    {
      task: 'html',
      src: 'src/**/index.html',
      dest: 'build',
      watch: 'src/**/index.html'
    },
  ],
  serve: {
    dir: 'build',
    port: 3000
  }
}

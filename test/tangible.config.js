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
    }
  ],
  docs: [
    {
      src: '**/*.php,src/**/*.js,src/**/*.scss',
      dest: 'build/docs.json'
    },
  ],
  serve: {
    src: '.',
    port: 3000
  }
}

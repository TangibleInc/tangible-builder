module.exports = {
  build: [
    {
      task: 'js',
      src: 'src/index.js',
      dest: 'build/app.min.js',
      watch: 'src/**/*.js',
      react: 'wp.element',
    },
    // Another bundle that shares same files as above, but with different React pragma
    {
      task: 'js',
      src: 'src/index2.js',
      dest: 'build/app2.min.js',
      watch: 'src/**/*.js'
    },
    {
      task: 'sass',
      src: 'src/index.scss',
      dest: 'build/app.min.css',
      watch: 'src/**/*.scss',
    },
    {
      task: 'html',
      src: 'src/**/index.html',
      dest: 'build',
      watch: 'src/**/index.html'
    },
    // {
    //   task: 'schema',
    //   src: 'tangible.schema.ts',
    //   dest: 'tangible.schema.json',
    // }
  ],
  serve: {
    dir: 'build',
    port: 3000
  }
}

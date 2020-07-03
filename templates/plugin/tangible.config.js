module.exports = {
  build: [

    // Frontend - See includes/enqueue.php

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

    // Admin

    {
      task: 'sass',
      src: 'assets/src/admin.scss',
      dest: 'assets/build/admin.min.css',
      watch: 'assets/src/admin/*.scss'
    },
  ]
}
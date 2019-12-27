const path = require('path')

module.exports = ({ appRoot, appConfigPath, fileExists }) => {

  if (fileExists(appConfigPath)) return

  fs.writeFileSync(appConfigPath,
    `module.exports = {
  build: [
    /*{
      task: 'js',
      src: 'src/index.js',
      dest: 'build/app.min.js',
      watch: 'src/**/*.js'
    },
    {
      task: 'sass',
      src: 'src/index.scss',
      dest: 'build/app.min.css',
      watch: 'src/**/*.scss'
    },*/
  ]
}
`
  )

  console.log(`Created new config file: ${path.relative(appRoot, appConfigPath)}`)
}

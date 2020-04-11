const path = require('path')
const glob = require('glob')

const renderSchema = require('../tasks/schema')

module.exports = async function schemaCommand(config) {

  const { appRoot, args } = config

  const schemaFileName = 'tangible.schema.ts'
  const schemaGlob =
    (args.length ? args : ['.']).map(schemaPath =>
      path.join(appRoot, schemaPath, schemaFileName)
    ).join(',')

  const schemaFiles = glob.sync(schemaGlob, {
    ignore: [
      '**/.git/**',
      '**/build/**',
      '**/node_modules/**',
      '**/vendor/**'
    ].map(p => path.join(appRoot, p))
  })

  // Run in parallel
  await Promise.all(schemaFiles.map(src =>
    renderSchema({
      ...config,
      task: {
        src,
        dest: src.replace('.ts', '.json')
      }
    })
  ))
}

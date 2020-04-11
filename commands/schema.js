const fsx = require('fs-extra')
const path = require('path')
const { inspect } = require('util')
const glob = require('glob')
const chalk = require('chalk')

const schemaProcessor = require('@tangible/schema-processor')
// const schemaProcessor = require('../plugins/schema-processor')

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
  await Promise.all(schemaFiles.map(schemaFilePath =>
    renderSchemaFile({
      appRoot,
      schemaFilePath
    })
  ))
}

async function renderSchemaFile({
  appRoot = process.cwd(),
  schemaFilePath,
}) {

  const schemaFileName = path.relative(appRoot, schemaFilePath)

  if ( ! await fsx.exists(schemaFilePath)) {
    console.log('Schema file not found', schemaFileName)
    return
  }

  const jsonFileName = schemaFileName.replace('.ts', '.json')
  const jsonFilePath = path.join(appRoot, jsonFileName)

  try {

    // Based on https://github.com/YousefED/typescript-json-schema

    const basePath = appRoot
    const compilerOptions = {}
    const settings = {}

    const program = schemaProcessor.getProgramFromFiles([schemaFilePath], compilerOptions, basePath);
    const schema = schemaProcessor.generateSchema(program, '*', settings);

    // console.log(inspect(schema, { depth: Infinity, colors: true, compact: false }))

    await fsx.writeFile(jsonFilePath, JSON.stringify(schema, null, 2))

    console.log(chalk.green('schema'), schemaFileName, '->', jsonFileName)

  } catch(e) {
    console.log(chalk.red('schema'), schemaFileName, '->', jsonFileName)
    console.log(e)
  }
}
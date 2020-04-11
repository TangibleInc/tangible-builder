const fsx = require('fs-extra')
const path = require('path')
const { inspect } = require('util')
const glob = require('glob')
const chalk = require('chalk')

const schemaProcessor = require('@tangible/schema-processor')

// Use locally built library during development
// const schemaProcessor = require('../plugins/schema-processor')

module.exports = async function renderSchemaFile({
  appRoot,
  task: {
    src: schemaFilePath,
    dest: jsonFilePath,
  },
  isDev = false
}) {

  const schemaFileName = path.relative(appRoot, schemaFilePath)
  const jsonFileName = path.relative(appRoot, jsonFilePath)

  if ( ! await fsx.exists(schemaFilePath)) {
    console.log('Schema file not found', schemaFileName)
    return
  }

  try {

    // Based on https://github.com/YousefED/typescript-json-schema

    const basePath = appRoot
    const compilerOptions = {
      'lib': ['dom', 'es2015', 'es2016', 'es2017', 'esnext'],
      'jsx': 'preserve'
    }
    const settings = {}

    const program = schemaProcessor.getProgramFromFiles([schemaFilePath], compilerOptions, basePath);
    const schema = schemaProcessor.generateSchema(program, '*', settings);

    // console.log(inspect(schema, { depth: Infinity, colors: true, compact: false }))

    if (!schema || !schema.definitions) {
      // Error message displayed by compiler
      console.log(chalk.red('schema'), schemaFileName, '->', jsonFileName)
      return
    }

    await fsx.writeFile(jsonFilePath, JSON.stringify(schema.definitions, null, 2))

    console.log(chalk.green('schema'), schemaFileName, '->', jsonFileName)

  } catch(e) {
    console.log(chalk.red('schema'), schemaFileName, '->', jsonFileName)
    console.log(e)
  }
}

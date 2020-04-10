const fsx = require('fs-extra')
const path = require('path')
const { inspect } = require('util')
const glob = require('glob')
const tsj = require('ts-json-schema-generator')
const chalk = require('chalk')

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

  const generatorConfig = {
    path: schemaFilePath,

    // "exclude" option doesn't work for some reason
    // tsconfig: path.join(__dirname, '..', 'config', 'tsconfig.json'),

    type: '*', // Or <type-name> if you want to generate schema for that one type only
    expose: 'all', //
    jsDoc: 'extended',
    topRef: true,
    typeCheck: false
  }

  const jsonFileName = schemaFileName.replace('.ts', '.json')
  const jsonFilePath = path.join(appRoot, jsonFileName)

  try {
    const schema = tsj
      .createGenerator(generatorConfig)
      .createSchema(generatorConfig.type)
    const schemaString = JSON.stringify(schema, null, 2)

    await fsx.writeFile(jsonFilePath, schemaString)

    // console.log(inspect(schema, { depth: Infinity, colors: true, compact: false }))

    console.log(chalk.green('schema'), schemaFileName, '->', jsonFileName)

  } catch(e) {
    console.log(chalk.red('schema'), schemaFileName, '->', jsonFileName)
    console.log(e)
  }
}
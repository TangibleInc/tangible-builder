const glob = require('glob')
const fsx = require('fs-extra')
const parseDocblock = require('../tasks/docs')

module.exports = async function(config) {

  const { appConfig, chalk } = config
  let { docs } = appConfig

  if (!docs) return
  if (!Array.isArray(docs)) docs = [docs]

  console.log('Gather all DocBlock comments\n')

  for (const { src, dest, exclude = [] } of docs) {

    const globSrc = `{${
      Array.isArray(src) ? src.join(',') : src
    }}`

    const files = glob.sync(globSrc, {
      ignore: ['**/vendor/**', '**/build/**', '**/*.min.*', ...(
        typeof exclude==='string' ? exclude.split(',') : exclude
      )]
    })

    const docsResult = []

    for (const file of files) {

      const docBlocks = parseDocblock(await fsx.readFile(file, 'utf8'))
      if (!docBlocks.length) continue

      console.log(file)
      docsResult.push({
        file, docBlocks
      })
    }

    if (!docsResult) {
      console.log('No files found with DocBlock comments')
      continue
    }

    // Ensure the destination folder exists (otherwise create it)
    await fsx.ensureFile(dest)

    await fsx.writeJson(dest, docsResult, { spaces: 2 })

    console.log(chalk.green('docs'), src, '->', dest)
  }
}

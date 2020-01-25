const glob = require('glob')
const fsx = require('fs-extra')
const parseDocblock = require('../tasks/docs')

const defaultDocsConfig = [
  {
    src: '**/*.php',
    dest: 'docs-dev/php.json'
  },
  {
    src: '**/*.js',
    dest: 'docs-dev/js.json'
  },
  {
    src: '**/*.scss',
    dest: 'docs-dev/scss.json'
  },
]

module.exports = async function(config) {

  console.log('Gather all DocBlock comments\n')

  const { appConfig, chalk } = config
  let {
    docs
  } = appConfig

  if (!docs) {
    docs = defaultDocsConfig

    console.log('Using default config\n')
    console.log(defaultDocsConfig)

  } else if (!Array.isArray(docs)) {
    docs = [docs]
  }

  for (const { src, dest, exclude = [] } of docs) {

    const sources = !Array.isArray(src) ? src.split(',') : src
    const globSrc = sources.length > 1 ? `{${
      sources.join(',')
    }}` : src

    const files = glob.sync(globSrc, {
      ignore: ['**/vendor/**', '**/node_modules/**', '**/build/**', '**/*.min.*', ...(
        typeof exclude==='string' ? exclude.split(',') : exclude
      )]
    })

    const docsResult = {}

    for (const file of files) {

      const docBlocks = parseDocblock(await fsx.readFile(file, 'utf8'))
      if (!docBlocks.length) continue

      console.log(file)

      docsResult[file] = docBlocks
    }

    if (!Object.keys(docsResult).length) {
      console.log(chalk.yellow('docs'), src, '->', 'No matching files found with DocBlock comments')
      continue
    }

    // Ensure the destination folder exists (otherwise create it)
    await fsx.ensureFile(dest)

    await fsx.writeJson(dest, docsResult, { spaces: 2 })

    console.log(chalk.green('docs'), src, '->', dest)
  }
}

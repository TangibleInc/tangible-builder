const path = require('path')
const glob = require('glob')
const fsx = require('fs-extra')
const parseDocblock = require('../tasks/docs')
const renderDocsHtml = require('../tasks/docs/render')

const defaultDocsConfig = [
  {
    title: 'PHP',
    src: '**/*.php',
    dest: 'docs-dev/generated/php.json'
  },
  {
    title: 'JS',
    src: '**/*.{js,ts,tsx}',
    dest: 'docs-dev/generated/js.json'
  },
  {
    title: 'SASS',
    src: '**/*.scss',
    dest: 'docs-dev/generated/scss.json'
  },
]

module.exports = async function(config) {

  const { args = [], appRoot, appConfig, chalk } = config

  if (args[0] && args[0]==='clean') {
    console.log('Remove generated HTML and its folder')
    await fsx.remove(path.join(appRoot, 'docs-dev', 'generated'))
    console.log('Done')
    return
  }

  let {
    docs
  } = appConfig

  console.log('Gather all DocBlock comments\n')

  if (!docs) {
    docs = defaultDocsConfig

    // console.log('Using default config\n')
    // console.log(defaultDocsConfig)

  } else if (!Array.isArray(docs)) {
    docs = [docs]
  }

  const allDocs = {}

  for (const { src, dest, exclude = [], title = 'PHP' } of docs) {

    const globSrc = Array.isArray(src) ? `{${
      src.join(',')
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
    // await fsx.ensureFile(dest)

    // await fsx.writeJson(dest, docsResult, { spaces: 2 })
    // console.log(chalk.green('docs'), src, '->', dest)

    allDocs[title] = docsResult
  }

  // Generate HTML page and serve

  let docsTitle = ''

  try {
    const pkg = JSON.parse(await fsx.readFile(path.join(appRoot, 'package.json')))
    docsTitle = pkg.title || pkg.name
  } catch(e) { console.log(e) }

  const allDocsDest = path.join('docs-dev', 'generated', 'index.html')

  await fsx.ensureFile(allDocsDest)
  await fsx.writeFile(allDocsDest, renderDocsHtml(allDocs, docsTitle))

  console.log(chalk.green('docs'), 'generated', allDocsDest)

  const serverConfig = {
    port: 3000,
    dir: 'docs-dev/generated'
  }

  require('./serve')({
    appConfig: { serve: serverConfig },
    chalk
  })
}

const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')

const main = async ({ args, options }) => {

  // Interactive prompts to create a new project

  console.log(chalk.bold('\nCreate new project'), chalk.gray('- Type Ctrl+C to quit at any time\n'))

  let defaultProjectName
  if (args.length && args[0]) {
    defaultProjectName = args[0]
    console.log(chalk.bold.white('Project name'), defaultProjectName)
  }

  const questions = [
    {
      type: 'list',
      name: 'newOrCurrent',
      message: 'Create folder',
      choices: ['New folder', 'In current folder'],
      when: () => defaultProjectName ? false : true,
      validate: (value) => value ? true : false,
      filter: (value) => value==='New folder' ? 'new' : 'current'
    },
    {
      type: 'input',
      name: 'name',
      message: 'Project name '+chalk.reset.gray('- lowercase alphanumeric with optional dash "-"'),
      when: (data) => !defaultProjectName && data.newOrCurrent==='new',
      validate: (value) => value ? true : false
    },
    {
      type: 'input',
      name: 'src',
      message: 'Source folder '+chalk.reset.gray('- Press enter for default'),
      default: 'src',
      validate: (value) => value ? true : false
    },
    {
      type: 'input',
      name: 'dest',
      message: 'Destination folder '+chalk.reset.gray('- Press enter for default'),
      default: 'build',
      validate: (value) => value ? true : false
    },
    {
      type: 'list',
      name: 'server',
      message: 'Static file server for development',
      default: 'yes',
      choices: ['yes', 'no'],
      filter: (value) => value==='yes',
      validate: (value) => value ? true : false
    }
  ]

  const answers = await inquirer.prompt(questions)

  console.log('answers', answers)

  const isNew = defaultProjectName || answers.newOrCurrent==='new'
  const projectName = defaultProjectName || answers.name || 'app'
  const projectFolder = isNew ? projectName : '.'
  const projectFolderFullPath = path.join(process.cwd(), projectFolder)
  const sourceFolderFullPath = path.join(projectFolderFullPath, answers.src)

  const appConfigPath = path.join(projectFolder, 'tangible.config.js')

  const appConfigJs = `module.exports = {
  build: [${ answers.server ? '' : `
    {
      task: 'js',
      src: 'src/index.js',
      dest: 'build/index.min.js',
      watch: 'src/**/*.js'
    },
    {
      task: 'sass',
      src: 'src/index.scss',
      dest: 'build/index.min.css',
      watch: 'src/**/*.scss'
    },
    {
      task: 'html',
      src: 'src/index.html',
      destFolder: 'build',
      watch: 'src/*.html'
    }
  `}]${ !answers.server ? '' : `,
  serve: {
    src: '${answers.src}',
    dest: '${answers.dest}',
    port: 3000
  }` }
}`

  if (isNew) {

    if (await fs.exists(projectFolderFullPath)) {
      if (!(await inquirer.prompt([{
        name: 'confirmed',
        type: 'confirm',
        default: false,
        message: `Overwrite existing folder ${projectFolder}`
      }])).confirmed) {
        return
      }
      await fs.emptyDir(projectFolderFullPath)
    }

    console.log(`\nCreate project folder: ${projectFolder}`)
    await fs.ensureFile(appConfigPath)

    console.log(`Create project config: ${appConfigPath}`)
    await fs.writeFile(appConfigPath, appConfigJs, 'utf8')

    console.log(`Create package.json`)
    await fs.writeJson(path.join(projectFolderFullPath, 'package.json'), {
      name: projectName,
      scripts: {
        dev: 'tgb dev',
        build: 'tgb dev',
        beautify: 'tgb beautify',
      },
      dependencies: {},
      devDependencies: {
        '@tangible/builder': '1.x'
      }
    }, { spaces: 2 })

    await fs.ensureDir(sourceFolderFullPath, options)
    await fs.writeFile(path.join(sourceFolderFullPath, 'index.js'), '', 'utf8')
    await fs.writeFile(path.join(sourceFolderFullPath, 'index.scss'), '', 'utf8')

    if (answers.server) {
      await fs.writeFile(path.join(sourceFolderFullPath, 'index.html'), `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>App</title>
  <link rel="stylesheet" href="/index.min.css">
</head>
<body>

  Hello, world!

  <script src="/index.min.js"></script>
</body>
</html>`
      , 'utf8')
    }

    console.log('Done.\n')
    console.log(`Start by running: cd ${projectFolder} && npm install`)
    console.log(`Then: npm run dev`)
    return
  }

  // Existing project
  if (await fs.exists(appConfigPath)) {
    if (await inquirer.prompt([{
      name: 'abort',
      type: 'confirm',
      message: `Overwrite existing config file ${appConfigPath}`
    }]).abort) {
      return
    }
  }

  console.log(`\nCreate project config: ${appConfigPath}`)
  await fs.writeFile(appConfigPath, appConfigJs, 'utf8')
}

module.exports = async (config) => {
  try {
    await main(config)
  } catch(error) {
    if(error.isTtyError) {
      console.log(chalk.red('Error'),
        `Prompt couldn't be rendered in the current environment`
      )
    } else {
      console.log(chalk.red('Error'), error)
    }
  }
  process.exit()
}

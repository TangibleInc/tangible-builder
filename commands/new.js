const path = require('path')
const fs = require('fs-extra')
const glob = require('glob')
const inquirer = require('inquirer')
const chalk = require('chalk')
const htmlProcessor = require('../plugins/html-processor')
const changeCase = require('../utils/changeCase')

const main = async ({ args, options }) => {

  // Interactive prompts to create a new project

  console.log(chalk.bold('\nCreate new project'), chalk.gray('- Type Ctrl+C to quit at any time\n'))

  let defaultProjectName
  if (args.length && args[0]) {
    defaultProjectName = changeCase.kebab(args[0])
    console.log(chalk.bold.white('Project name'), defaultProjectName)
  }

  const questions = [
    {
      type: 'list',
      name: 'type',
      message: 'Project type',
      default: 'Static site',
      choices: [
        'Static site',
        'Plugin',
        'Theme',
        'Child theme'
      ],
      filter: (value) => changeCase.kebab(value),
      validate: (value) => value ? true : false
    },
    {
      type: 'input',
      name: 'parentThemeSlug',
      message: 'Parent theme slug (bb-theme, astra, ..)',
      when: (data) => data.type==='child-theme',
      validate: (value) => value ? true : false,
      filter: value => changeCase.kebab(value)
    },
    {
      type: 'input',
      name: 'name',
      message: 'Project name '+chalk.reset.gray('- lowercase alphanumeric with optional dash "-"'),
      when: (data) => !defaultProjectName,
      validate: (value) => value ? true : false,
      filter: value => changeCase.kebab(value)
    },
    {
      type: 'input',
      name: 'title',
      message: 'Project title '+chalk.reset.gray('- Press enter for default'),
      default: data => changeCase.title(data.name || defaultProjectName)
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description'
    },
  ]

  const answers = await inquirer.prompt(questions)

  const projectName = defaultProjectName || answers.name || 'app'
  const projectType = answers.type

  const projectFolder = projectName
  const projectFolderFullPath = path.join(process.cwd(), projectFolder)

  const isStatic = projectType==='static-site'
  const sourceFolder = isStatic ? 'src' : 'assets/src'
  const sourceFolderFullPath = path.join(projectFolderFullPath, sourceFolder)
  const destinationFolder = isStatic ? 'build' : 'assets/build'

  const appConfigPath = path.join(projectFolder, 'tangible.config.js')

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
  await fs.ensureDir(sourceFolderFullPath, options)

  console.log('Copy project type template files and replace placeholders')

  const templateFolder = path.join(__dirname, '..', 'templates', projectType)

  if (!(await fs.pathExists(templateFolder))) {
    console.log('Unknown project type', projectType)
    return
  }

  const templateData = {
    projectType,
    projectName,
    sourceFolder,
    destinationFolder,

    // For plugins
    projectTitle: answers.title,
    projectDescription: answers.description || '',
    projectNameKebabCase: changeCase.kebab(projectName),
    projectNamePascalCase: changeCase.pascal(projectName),
    projectNameConstantCase: changeCase.constant(projectName),
    projectNameSnakeCase: changeCase.snake(projectName),

    // Child theme
    parentThemeSlug: answers.parentThemeSlug
  }

  const templateFiles = glob.sync(path.join(templateFolder, '**', '*.*'))

  for (const templateFile of templateFiles) {

    const destFile = path.join(projectFolderFullPath, path.relative(templateFolder, templateFile))
    const srcString = await fs.readFile(templateFile, 'utf8')
    const result = await htmlProcessor.render(srcString, templateData, {
      filename: templateFile,
      root: path.resolve(templateFolder)
    })

    await fs.ensureFile(destFile) // Create any directories needed
    await fs.writeFile(destFile, result)

    console.log('  '+(path.relative(projectFolderFullPath, destFile)))
  }

  console.log('Done.\n')
  console.log(`Start by running: cd ${projectFolder} && npm install${projectType==='plugin' ? ' && composer install' : ''}`)
  console.log(`Then: npm run dev`)
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

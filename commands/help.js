module.exports = (config) => {
  console.log(`
Tangible Builder - https://docs.tangible.one/modules/builder/

Usage: tgb [command] (...options)

Commands:

new - Create initial config file
help - Show this help message

dev - Build for development
build - Build for production

lint - Lint code and show any warnings for syntax/fromatting
beautify - Beautify code - Make sure to Git commit before running

docs - Gather DocBlock comments into a JSON file
schema - Compile tangible.schema.ts files to JSON schema

gitl - Manage Git child repos
serve - Start static file server
${
  config.notFound ? `\nConfig not found: Place a file called "tangible.config.js" in app root folder` : ''
}`)
}

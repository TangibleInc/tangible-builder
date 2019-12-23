module.exports = (config) => {
  console.log(`
Usage: tgb [command] (...options)

Commands:

dev - Build for development
build - Build for production
init - Create initial config file
gitl - Manage Git child repos
help - Show this help message
${config.notFound ? `\nConfig not found: Place a file called "tangible.config.js" in app root folder` : ''}`)
}

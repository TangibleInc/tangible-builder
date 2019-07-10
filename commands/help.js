module.exports = (config) => {
  console.log(`
Usage: tgb [command] (...options)

Commands:

dev - Build for development
build - Build for production
help - Show this help message
${config.notFound ? `\nConfig not found: Place a file called "tangible.config.js" in app root folder` : ''}`)
}

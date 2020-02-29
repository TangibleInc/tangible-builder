const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
const renderMarkdown = require('../markdown-processor')

/**
 * Add support for include() and render Markdown files
 */
ejs.fileLoader = function(filename, encoding) {
  const ext = path.extname(filename)
  if (ext!=='.md') return fs.readFileSync(filename) // Default file stream
  return {
    toString: () => renderMarkdown(
      fs.readFileSync(filename, 'utf8')
    )
  }
}

module.exports = {
  async render(str, data = {}, options = {}) {
    // The regex "s" flag makes "." match any character including new lines
    return (await ejs.render(str, data, {
      async: true,
      ...options
    })).replace(/<markdown>(.*?)<\/markdown>/gs, function(match, p1) {
      return renderMarkdown(p1)
    })
  }
}
const markdownIt = require('markdown-it')
const hljs = require('highlight.js') // https://highlightjs.org/

const attributesPlugin = require('./plugins/attributes')
const anchorPlugin = require('./plugins/anchor')
const taskListPlugin = require('./plugins/taskList')

const md = markdownIt({
  preset: 'default',
  html: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code class="language-'+lang+'">' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>'
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

  // <!--{ name="value" }-->
  .use(attributesPlugin)
  .use(anchorPlugin)

  .use(taskListPlugin, {
    // Checkbox without `disabled` attribute
    enabled: true
  })

module.exports = function renderMarkdown(content = '', options = {}) {

  return md.render(content, options)

  /** TODO: Pass parsed attributes to HTML template?

  const frontmatter = require('front-matter')
  const {
    body,
    attributes: meta = {}
  } = frontmatter(content)

  const html = options.markdown
    ? options.markdown(body, options)
    : md.render(body, options)

  return { html, meta }
  */
}

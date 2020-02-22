
module.exports = function renderDocsHtml(allDocs, docsTitle) {
  return `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${ docsTitle || 'Docs' }</title>
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Noto Sans", "Ubuntu", "Droid Sans", "Helvetica Neue", sans-serif;
  margin: 10px;
  font-size: 16px;
}
h1 { font-size: 20px; }
h2 { font-size: 18px; }
h3 { font-size: 15px; }
hr { width: 100%; border: 0; border-bottom: 1px solid #ccc; margin: 1rem 0; }
code { font-size: 14px; }
.doc-file { margin-bottom: 1rem; }
</style>
</head>
<body>
${ docsTitle ? `<h1>${docsTitle}</h1>` : '' }
${// Each doc type
  Object.keys(allDocs).map(title => `
    <h2>${title}</h2>
    ${
  // Each file
  Object.keys(allDocs[title]).map(file => `
    <div class="doc-file"><code>${file}</code></div>
    ${
  // Each DocBlock
  allDocs[title][file].map(data =>
    (data.definition ? (
      '<code>'+(data.definitionType ? `${data.definitionType} ` : '')
      +data.definition
      +'</code><br>'
    ): '')
    +(data.title ? `${data.title}<br>` : '')
    +Object.keys(data).filter(k => ['title', 'definition', 'definitionType'].indexOf(k)<0).map(key => `
    ${key}: ${ typeof data[key]==='string' ? data[key].replace(/[\r\n]+/g, "\n").replace(/\n/g, '<br>&nbsp;&nbsp;') : (
  // Each @tag
  Array.isArray(data[key])
    ? (data[key][1] ? '<br>' : '')+(data[key].map(subValue => `${data[key][1] ? '&nbsp;&nbsp;' : ''}${
      typeof subValue==='string' ? subValue.replace(/[\r\n]+/g, "\n").replace(/\n/g, '<br>&nbsp;&nbsp;') :
        subValue.name
          // @param
          ? (`<code>${subValue.name}</code> - ${
            Object.keys(subValue).filter(k => k!=='name')
              .map(subValueKey => `${subValueKey}: ${subValue[subValueKey]}`).join(', ')
          }`)
          : Object.keys(subValue).map(subValueKey => `${subValueKey}: ${subValue[subValueKey]}`).join(', ')
    }`).join('<br>'))
    : '<br>'+(Object.keys(data[key]).map(subKey => `
        &nbsp;&nbsp;${subKey}: ${data[key][subKey]}
      `).join('<br>')
    ))}
`
    ).join('<br>') // DocBlock fields
  ).join('<br><br>') // DocBlock
}`).join('<hr>') // File
}`).join('') // DocType
}
</body>
</html>`
}
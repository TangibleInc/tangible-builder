const { regexp } = require('constants')

const {

  newlineRe, multilineRe,
  rtrimRe, ltrimRe, ltrimNewlineRe,

  commentStartRe, commentEndRe, lineCommentRe,
  stringStartRe, startCurlyRe, endCurlyRe,
  propertyStartRe, propertyRe, propertyValuesRe,
  returnTypeRe,

} = regexp

function detectNewline (string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string')
  }

  const newlines = string.match(newlineRe) || []

  if (newlines.length === 0) {
    return
  }

  const crlf = newlines.filter(newline => newline === '\r\n').length
  const lf = newlines.length - crlf

  return crlf > lf ? '\r\n' : '\n'
}

function parseDocblock(docblock) {

  const line = detectNewline(docblock) || "\n"

  docblock = docblock
    .replace(commentStartRe, '')
    .replace(commentEndRe, '')
    .replace(stringStartRe, '$1')

  let prev = ''
  while (prev !== docblock) {
    prev = docblock
    docblock = docblock.replace(multilineRe, `${line}$1 $2${line}`)
  }
  docblock = docblock.replace(ltrimNewlineRe, '').replace(rtrimRe, '')

  const result = {}

  // Title and description

  let rest = docblock
  let pos = rest.indexOf("\n")

  if (pos === -1) {
    // Only line is title
    if (!propertyStartRe.exec(line)) {
      result.title = rest
      return result
    }
  } else {
    do {

      const line = rest.substr(0, pos).replace(stringStartRe, '')

      if (line) {
        // First property encountered
        if (propertyStartRe.exec(line)) break

        if (!result.title) {
          result.title = line.replace(ltrimRe, '').replace(rtrimRe, '')
        } else if (!result.description) {
          result.description = line
        } else {
          // Keep adding to description
          result.description += "\n" + line
        }
      }

      if (typeof result.description !== 'undefined') {
        result.description = result.description.replace(ltrimRe, '').replace(rtrimRe, '')
        if (!result.description) delete result.description
      }

      rest = rest.substr(pos + 1)

    } while ((pos = rest.indexOf("\n")) !== -1)
  }

  // Properties

  let match

  while ((match = propertyRe.exec(rest))) {

    const key = match[1]
    const value = match[2].replace(lineCommentRe, '')

    if (key==='param') {

      // Parameter: Type, name, description

      if (!result[key]) result[key] = []

      const valMatch = propertyValuesRe.exec(value)
      const prop = {
        type: (valMatch[1] || '').replace(startCurlyRe, '').replace(endCurlyRe, ''),
        name: valMatch[2] || '',
        description: (valMatch[3] || '').replace(ltrimRe, '').replace(rtrimRe, ''),
      }

      if (!prop.description) delete prop.description

      result[key].push(prop)
      continue
    }

    if (key==='return' || key==='returns' || key==='var') {

      // Return, Variable: Type, description

      const valMatch = returnTypeRe.exec(value)
      if (valMatch) {
        const prop = {
          type: (valMatch[1] || '').replace(startCurlyRe, '').replace(endCurlyRe, ''),
          description: (valMatch[2] || '').replace(ltrimRe, '').replace(rtrimRe, ''),
        }

        if (!prop.description) delete prop.description

        result[
          key==='returns' ? 'return' : key
        ] = prop
      }
      continue
    }

    // Array properties

    if (key==='see') {
      if (!result[key]) result[key] = []
      result[key].push(value)
      continue
    }

    result[key] = value
  }

  return result
}

module.exports = parseDocblock
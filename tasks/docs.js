/**
 * Parse DocBlock comments - Language-agnostic syntax
 *
 * PHPDoc - @see https://docs.phpdoc.org/references/phpdoc/types.html
 * JSDoc - @see https://jsdoc.app/tags-param.html
 * SassDoc - @see http://sassdoc.com/
 */

const commentEndRe = /\*\/$/
const commentStartRe = /^\/\*\*/
const docblockRe = /\/\*{2}[\s|\r|\n]([\s\S]+?)\*\//g
const lineCommentRe = /(^|\s+)\/\/([^\r\n]*)/g
const ltrimRe = /^\s*/
const rtrimRe = /\s*$/
const ltrimNewlineRe = /^(\r?\n)+/
const multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *(?![^@\r\n]*\/\/[^]*)([^@\r\n\s][^@\r\n]+?) *\r?\n/g

const stringStartRe = /(\r?\n|^)\s*\*\s?/g
const propertyRe = /(?:^|\r?\n)\s*@(\S+)\s*([^\r\n]*)/g
const propertyValuesRe = /(\S+)\s*(\S+)*([^\r\n]*)/
const returnTypeRe = /(\S+)*([^\r\n]*)/
const startCurlyRe = /^{/
const endCurlyRe = /}$/

const detectNewline = string => {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string')
  }

  const newlines = string.match(/(?:\r?\n)/g) || []

  if (newlines.length === 0) {
    return
  }

  const crlf = newlines.filter(newline => newline === '\r\n').length
  const lf = newlines.length - crlf

  return crlf > lf ? '\r\n' : '\n'
}

function extract(contents) {

  let match
  let matches = []
  while ((match = docblockRe.exec(contents))) {
    matches.push(match[0])
  }
  return matches.map(match => match.replace(ltrimRe, ''))
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
    if (line[0]!=='@') {
      result.title = rest
      return result
    }
  } else {
    do {

      const line = rest.substr(0, pos) // Every line is already left/right trimmed

      if (line) {
        // First property encountered
        if (line[0]==='@') break

        if (!result.title) {
          result.title = line
        } else if (!result.description) {
          result.description = line
        } else {
          // Keep adding to description
          result.description += "\n" + line
        }
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

      result[key].push(prop)
      continue
    }

    if (key==='return' || key==='returns') {

      // Return: Type, description

      const valMatch = returnTypeRe.exec(value)
      if (valMatch) {
        const prop = {
          type: (valMatch[1] || '').replace(startCurlyRe, '').replace(endCurlyRe, ''),
          description: (valMatch[2] || '').replace(ltrimRe, '').replace(rtrimRe, ''),
        }

        result['return'] = prop
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

function parse(docblocks = '') {
  return extract(docblocks)
    .map(docblock => parseDocblock(docblock))
    .filter(docblockTags => Object.keys(docblockTags).length !== 0)
}

module.exports = parse

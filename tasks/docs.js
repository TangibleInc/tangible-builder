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
const newlineRe = /(?:\r?\n)/g

const stringStartRe = /(\r?\n|^)\s*\*\s?/g
const propertyRe = /(?:^|\r?\n)*@(\S+)\s*([^\*@\r\n]*)/g
const propertyStartRe = /\s*@(\S+)/
const propertyValuesRe = /(\S+)\s*(\S+)*([^\r\n]*)/
const returnTypeRe = /(\S+)*([^\r\n]*)/
const startCurlyRe = /^{/
const endCurlyRe = /}$/
const repeatedSpaceRe = /(\s+)/g

const definitionClassRe = /^\s*[c|C]lass\s*(\S+)\s*(extends\s*\S+)?\s*(implements\s*(([^\s{\/],?\s*)+))?\s*{/
const definitionFuncRe = /^\s*(public|private|protected|static)?\s*function\s*(\S+)\s*\((\s*([^\s{\/],?\s*)+)?\)\s*{/
// const definitionPHPAnonFuncRe = //
// const definitionJSAnonFuncRe = //
// const definitionCSSRe = //

const detectNewline = string => {
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

function extract(contents) {

  let match
  let matches = []
  while ((match = docblockRe.exec(contents))) {

    let block = match[0]

    // Extract class/function definition following a DocBlock

    let index = match.index + block.length
    let rest = contents.substr(index)

    let definition
    let definitionType
    let defMatch

    if ((defMatch = definitionClassRe.exec(rest)) && defMatch[1]) {
      definitionType = 'class'
      definition = defMatch[1]
      if (defMatch[2]) definition += ' '+defMatch[2].replace(repeatedSpaceRe, ' ').replace(rtrimRe, '')
      if (defMatch[3]) definition += ' '+defMatch[3].replace(repeatedSpaceRe, ' ').replace(rtrimRe, '')
    } else if ((defMatch = definitionFuncRe.exec(rest)) && defMatch[2]) {
      definitionType = (defMatch[1] ? defMatch[1]+' ' : '')+'function'
      definition = defMatch[2]+(
        defMatch[3] ? '('+defMatch[3]+')' : '()'
      )
    }

    if (definition) {
      block = block.replace(commentEndRe, '\n * @definitionType '+definitionType+'\n * @definition '+definition+'\n */')
    }

    matches.push(block)
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

function parse(docblocks = '') {
  return extract(docblocks)
    .map(docblock => parseDocblock(docblock))
    .filter(docblockTags => Object.keys(docblockTags).length !== 0)
}

module.exports = parse

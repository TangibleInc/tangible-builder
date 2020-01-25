const { regexp } = require('constants')

const {
  docblockRe,
  definitionFuncRe,
  definitionClassRe,

  repeatedSpaceRe,
  rtrimRe, ltrimRe,
  commentEndRe
} = regexp

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

module.exports = extract
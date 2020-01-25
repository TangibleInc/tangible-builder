/**
 * Parse DocBlock comments - Language-agnostic syntax
 *
 * PHPDoc - @see https://docs.phpdoc.org/references/phpdoc/types.html
 * JSDoc - @see https://jsdoc.app/tags-param.html
 * SassDoc - @see http://sassdoc.com/
 */

const extract = require('./extract')
const parseDocblock = require('./parse')

function parse(docblocks = '') {
  return extract(docblocks)
    .map(docblock => parseDocblock(docblock))
    .filter(docblockTags => Object.keys(docblockTags).length !== 0)
}

module.exports = parse

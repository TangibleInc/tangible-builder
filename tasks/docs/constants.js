const regexp = {

  commentEndRe: /\*\/$/,
  commentStartRe: /^\/\*\*/,
  docblockRe: /\/\*{2}[\s|\r|\n]([\s\S]+?)\*\//g,
  lineCommentRe: /(^|\s+)\/\/([^\r\n]*)/g,
  ltrimRe: /^\s*/,
  rtrimRe: /\s*$/,
  ltrimNewlineRe: /^(\r?\n)+/,
  multilineRe: /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *(?![^@\r\n]*\/\/[^]*)([^@\r\n\s][^@\r\n]+?) *\r?\n/g,
  newlineRe: /(?:\r?\n)/g,

  stringStartRe: /(\r?\n|^)\s*\*\s?/g,
  propertyRe: /(?:^|\r?\n)*@(\S+)\s*([^\*@\r\n]*)/g,
  propertyStartRe: /\s*@(\S+)/,
  propertyValuesRe: /(\S+)\s*(\S+)*([^\r\n]*)/,
  returnTypeRe: /(\S+)*([^\r\n]*)/,
  startCurlyRe: /^{/,
  endCurlyRe: /}$/,
  repeatedSpaceRe: /(\s+)/g,

  definitionClassRe: /^\s*[c|C]lass\s*(\S+)\s*(extends\s*\S+)?\s*(implements\s*(([^\s{\/],?\s*)+))?\s*{/,
  definitionFuncRe: /^\s*(public|private|protected|static)?\s*function\s*(\S+)\s*\((\s*([^\s{\/],?\s*)+)?\)\s*{/,
  // definitionPHPAnonFuncRe: //,
  // definitionJSAnonFuncRe: //,
  // definitionCSSRe: //,


}

module.exports = {
  regexp
}

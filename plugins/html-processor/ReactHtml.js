// Based on https://github.com/developit/vhtml

const emptyTags = [
	'area',
	'base',
	'br',
	'col',
	'command',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]

const rawTags = [
  'raw'
]

// escape an attribute
const map = {'&':'amp','<':'lt','>':'gt','"':'quot',"'":'apos'};
const esc = str => String(str).replace(/[&<>"']/g, s=>`&${map[s]};`);
const setInnerHTMLAttr = 'dangerouslySetInnerHTML';
const DOMAttributeNames = {
	className: 'class',
	htmlFor: 'for'
};

const sanitized = {};

/** Hyperscript reviver that constructs a sanitized HTML string. */
function h(name, attrs) {
  const stack=[]
  let s = '';
	attrs = attrs || {};
	for (let i=arguments.length; i-- > 2; ) {
		stack.push(arguments[i]);
	}

  if (typeof name==='function') {

    // Dynamic tags
    attrs.children = stack.reverse();
		return name(attrs);
		// return name(attrs, stack.reverse());
	}

  if (rawTags.indexOf(name) >= 0) {
    name = ''
    attrs[setInnerHTMLAttr] = { __html: stack.reverse().join('\n') }
  }

	if (name) {
		s += '<' + name;
		if (attrs) for (let i in attrs) {
			if (attrs[i]!==false && attrs[i]!=null && i !== setInnerHTMLAttr) {
				s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(attrs[i])}"`;
			}
		}
		s += '>';
	}

	if (emptyTags.indexOf(name) === -1) {

    if (attrs[setInnerHTMLAttr]) {

      s += attrs[setInnerHTMLAttr].__html;

    } else while (stack.length) {
			const child = stack.pop();
			if (child) {
				if (child.pop) {
					for (let i=child.length; i--; ) stack.push(child[i]);
				}
				else {
					s += sanitized[child]===true ? child : esc(child);
				}
			}
		}

		s += name ? `</${name}>` : '';
	}

	sanitized[s] = true;
	return s;
}

module.exports = {
  createElement: h,
  createFragment(children) {
    return h('', {}, children)
  }
}
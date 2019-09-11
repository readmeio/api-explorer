/* eslint-disable */
const RGXP = /^\[block:(.*)\]([^]+?)\[\/block\]\s/g;
const MAP = {
  types: {
    "api-header": "heading",
    // "html": ,
    // "embed": ,
    "code": "code",
    "callout": "blockquote",
    "parameters": "table",
    "image": "image",
  }
};

function tokenize(eat, value, silent) {
  let [match, type, json] = RGXP.exec(value) || [];

  if (!type) return;

  match = match.trim();
  json = json && JSON.parse(json) || {};
    
  switch (type) {
  case 'code':
    return eat(match)({
      type: 'rdme-wrap',
      className: 'tabs',
      data: {
        hName: 'rdme-wrap',
        hProperties: {test: 'val'},
      },
      children: json.codes.map(obj => ({
        type: 'code',
        value: obj.code,
        language: obj.language,
      })),
    });
    break;
  case 'api-header':
    return eat(match)({
      type: 'heading',
      depth: json.level,
      children: this.tokenizeInline(json.title, eat.now())
    });
    break;
  case 'callout':
    const map = {
      success: '👍',
      info: 'ℹ',
      warning: '⚠️',
      danger: '🛑',
    };
    json.title = `${map[json.type]} **${json.title}**`;
    return eat(match)({
      type: 'blockquote',
      className: json.type,
      children: [
        ...this.tokenizeBlock(json.title, eat.now()),
        ...this.tokenizeBlock(json.body, eat.now())
      ]
    });
    break;
  }
}

function parser() {
  const { Parser } = this;
  // console.dir(Parser)
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  
  tokenizers.magicBlocks = tokenize;
  methods.splice(methods.indexOf('newline'), 0, 'magicBlocks');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  console.log({sanitizeSchema})

  const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;
  
  tags.push('rdme-wrap');
  attr['rdme-wrap'] = ['className', 'test'];
  
  return parser;
}

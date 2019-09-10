/* eslint-disable */
const RGXP = /\[block:(.*)\]([\s\S]+)\[\/block\]/.source;
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
  let [match, type, json] = new RegExp(`^${RGXP}`).exec(value) || [];

  if (!(type && type in MAP.types)) return;
  
  match = match.trim();
  json = JSON.parse(json);

  return eat(match)({
    type: MAP.types[type],
    depth: 1,
    children: this.tokenizeInline(json.title, eat.now())
  });
}

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  
  tokenizers.magicBlocks = tokenize;
  methods.splice(methods.indexOf('newline'), 0, 'magicBlocks');
}

module.exports = parser;
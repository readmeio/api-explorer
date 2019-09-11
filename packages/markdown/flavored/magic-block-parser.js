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
  json = json && JSON.parse(json);
    
  if (type=='code') return eat(match)({
    type: 'div',
    children: json.codes.map(obj => ({type: 'code', value: obj.code, language: obj.language }))
  })
  if (type=='api-header') return eat(match)({
    type: 'heading',
    depth: json.level,
    children: this.tokenizeInline(json.title, eat.now())
  })
  if (type=='callout') {
    return eat(match)({
      type: 'blockquote',
      className: json.type,
      children: this.tokenizeInline(json.title, eat.now())
    })
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
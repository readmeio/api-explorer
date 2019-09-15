/* eslint-disable consistent-return */
const RGXP = /^\[block:(.*)\]([^]+?)\[\/block\]/;

function tokenize(eat, value) {
  let [match, type, json] = RGXP.exec(value) || [];

  if (!type) return;

  match = match.trim();
  type = type.trim();
  json = (json && JSON.parse(json)) || {};

  switch (type) {
    case 'code':
      return eat(match)({
        type: 'rdme-wrap',
        className: 'tabs',
        data: { hName: 'rdme-wrap' },
        children: json.codes.map(obj => ({
          type: 'code',
          value: obj.code,
          meta: obj.name || null,
          lang: obj.language,
          className: 'tab-panel',
        })),
      });
    case 'api-header':
      return eat(match)({
        type: 'heading',
        depth: json.level || 1,
        children: this.tokenizeInline(json.title, eat.now()),
      });
    case 'image':
      return eat(match)({
        type: 'rdme-figure',
        data: { hName: 'rdme-figure' },
        className: 'test',
        children: json.images.map(img => {
          const [url, alt] = img.image;
          return {
            type: 'image',
            title: img.caption, // this.tokenizeInline(img.caption, eat.now()),
            url,
            alt,
          };
        }),
      });
    case 'callout': {
      const map = {
        success: '👍',
        info: 'ℹ',
        warning: '⚠️',
        danger: '🛑',
      };
      json.title = `${map[json.type] || '👋'} **${json.title}**`;
      return eat(match)({
        type: 'blockquote',
        className: json.type,
        children: [
          ...this.tokenizeBlock(json.title, eat.now()),
          ...this.tokenizeBlock(json.body, eat.now()),
        ],
      });
    }
    default:
      return eat(match)({
        type: 'div',
        children: this.tokenizeBlock(json.body, eat.now()),
        data: json,
      });
  }
}

function parser() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.magicBlocks = tokenize;
  methods.splice(methods.indexOf('newline'), 0, 'magicBlocks');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;


  attr.li = ['checked'];

  tags.push('rdme-wrap');
  attr['rdme-wrap'] = ['className'];
  
  tags.push('rdme-figure');
  // attr['rdme-figure'] = ['className'];

  return parser;
};

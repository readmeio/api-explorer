/* eslint-disable consistent-return */
const RGXP = /^(```[^]*```)\n\n/;

function tokenize(eat, value) {
  const [match] = RGXP.exec(value) || [];
  if (!match) return;
  const kids = match
    .split('```')
    .filter(val => val.trim())
    .map(val => {
      val = '```' + val.replace('```', '') + '```';
      const [, lang, meta=null, code=''] = /```(\w+)?(?:\s+([\w-\.]+))?\s([^]+)```/gm.exec(val);
      return {
        type: 'code',
        className: 'tab-panel',
        value: code.trim(),
        meta,
        lang,
      };
    });
  return eat(match)({
    type: 'rdme-wrap',
    className: 'tabs',
    data: { hName: 'rdme-wrap' },
    children: kids,
  });
}

function parser() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.closeCodeBlocks = tokenize;
  methods.splice(methods.indexOf('newline'), 0, 'closeCodeBlocks');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;

  // tags.push('rdme-wrap');
  // attr['rdme-wrap'] = ['className'];

  return parser;
};

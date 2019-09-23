/* eslint-disable */
const RGXP = /^(```([^]+?)(?=```\n\n)```)\n\n/g // code blocks

function tokenizer(eat, value) {
  const [match] = RGXP.exec(value) || [];
  if (!match) return true;
  
  // construct children code blocks
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

  // return a single code block
  if (kids.length == 1)
    return eat(match)(kids[0]);

  // return the tabbed code block editor
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

  tokenizers.AdjacentCodeBlocks = tokenizer;
  methods.splice(methods.indexOf('newline'), 0, 'AdjacentCodeBlocks');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;

  return parser;
};

const RGXP = /^(```([^]+?)(?=```\n\n)```)\n\n/g; // code blocks

function tokenizer(eat, value) {
  const [match] = RGXP.exec(value) || [];
  if (!match) return true;

  // construct children code blocks
  const kids = match
    .split('```')
    .filter(val => val.trim())
    .map(val => {
      // eslint-disable-next-line no-param-reassign
      val = ['```', val.replace('```', ''), '```'].join('');
      // eslint-disable-next-line unicorn/no-unsafe-regex
      const [, lang, meta = null, code = ''] = /```(\w+)?(?: ([\w-.]+))?\s?([^]+)```/gm.exec(val);
      return {
        type: 'code',
        className: 'tab-panel',
        value: code.trim(),
        meta,
        lang,
        data: {
          hName: 'code',
          hProperties: { meta, lang },
        },
      };
    });

  // return a single code block
  if (kids.length === 1) return eat(match)(kids[0]);

  // return the tabbed code block editor
  return eat(match)({
    type: 'code-tabs',
    className: 'tabs',
    data: { hName: 'code-tabs' },
    children: kids,
  });
}

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.CodeTabs = tokenizer;
  methods.splice(methods.indexOf('newline'), 0, 'CodeTabs');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;

  tags.push('code-tabs');

  return parser;
};

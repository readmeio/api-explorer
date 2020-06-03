const RGXP = /^(```([^]*?)```)(?=\s*\n(?!```|\w)|```\n\n|$)/g;

function tokenizer(eat, value) {
  const [match] = RGXP.exec(value) || [];

  if (!match) return true;

  // construct children code blocks
  const kids = match
    .split('```')
    .filter(val => val.trim())
    .map(val => {
      /**
       * @todo: this assignment logic is too complex; we should simplify it.
       *
       * For each of our adjacent code blocks we'll:
       * 1) normalize any unbalanced tilde wrappers
       * 2) split the matching block in to three parts:
       *    - [lang] syntax extension
       *    - [meta] tab name (optional)
       *    - [code] snippet text
       */
      // eslint-disable-next-line no-param-reassign
      val = ['```', val.replace('```', ''), '```'].join('').trim();

      // eslint-disable-next-line unicorn/no-unsafe-regex
      const parts = /```[ \t]*([^\s]+)?(?: *([^\n]+))?\s?([^]+)```/gm.exec(val);
      const [, lang, , code = ''] = parts;

      let meta = parts[2];
      meta = typeof meta === 'string' ? meta.trim() : '';

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

  // return a tabbed code block
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

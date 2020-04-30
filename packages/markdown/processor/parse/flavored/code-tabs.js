const RGXP = /^(```([^]*?)```)(?=\n(?!```)|```\n\n|$)/g;

function tokenizer(eat, value) {
  const [match] = RGXP.exec(value) || [];

  if (!match) return true;

  let activeTab; // activate last block marked [open]
  const kids = match
    .split('```')
    .filter(val => val.trim())
    .map((val, ix) => {
      /**----------------------------------------------
       * CONSTRUCT CHILDREN CODE BLOCKS
       *  @todo: simplify this complex assignment logic.
       * ----------------------------------------------
       * For each of our adjacent code blocks we'll:
       * 1) normalize any unbalanced tilde wrappers
       * 2) split the matching block in to three parts:
       *    - syntax [lang] extension
       *    - [meta] tab name (optional)
       *    - the [code] snippet text
       */

      // eslint-disable-next-line no-param-reassign
      val = ['```', val.replace('```', ''), '```'].join('');

      // eslint-disable-next-line unicorn/no-unsafe-regex
      const matched = /```(?<lang>[^\s]+)?(?: *(?<meta>[^\n]+))?\s?(?<code>[^]+)```/gm.exec(val).groups;
      const { lang, code = '' } = matched;

      if (matched.meta && (matched.meta === '[open]' || matched.meta.search(/ \[open\]$/) > 0)) {
        activeTab = ix;
        matched.meta = matched.meta.replace(/\s?\[open\]$/, '');
      }

      const { meta } = matched;

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
    data: {
      hName: 'code-tabs',
      hProperties: { activeTab },
    },
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
  const atts = sanitizeSchema.attributes;

  tags.push('code-tabs');
  atts['code-tabs'] = ['activeTab'];

  return parser;
};

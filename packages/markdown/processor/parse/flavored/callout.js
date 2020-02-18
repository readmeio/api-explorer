const rgx = /^>\s?(\W\D) (.+)\n((?:>(?: .*)?\n)*)/;

function tokenizer(eat, value) {
  if (!rgx.test(value)) return true;

  // eslint-disable-next-line prefer-const
  let [match, icon, title, text] = rgx.exec(value);

  icon = icon.trim();
  text = text.replace(/>(?:(\n)|(\s)?)/g, '$1').trim();
  title = title.trim();

  const style = {
    ℹ️: 'info',
    '⚠️': 'warn',
    '👍': 'okay',
    '✅': 'okay',
    '❗️': 'error',
    '🛑': 'error',
    ℹ: 'info',
    '⚠': 'warn',
  }[icon];

  return eat(match)({
    type: 'rdme-callout',
    data: {
      hName: 'rdme-callout',
      hProperties: {
        theme: style || 'default',
        icon,
        title,
        value: text,
      },
    },
    children: [...this.tokenizeBlock(`${icon} ${title}`, eat.now()), ...this.tokenizeBlock(text, eat.now())],
  });
}

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.callout = tokenizer;
  methods.splice(methods.indexOf('newline'), 0, 'callout');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;

  tags.push('rdme-callout');
  attr['rdme-callout'] = ['icon', 'theme', 'title', 'value'];

  return parser;
};

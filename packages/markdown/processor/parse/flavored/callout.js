// eslint-disable-next-line unicorn/no-unsafe-regex
const rgx = /^>\s?((?:ℹ️|⁉️|❗️|‼️|\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+)\s(.+)\n((?:>(?: .*)?\n)*)/;

function tokenizer(eat, value) {
  if (!rgx.test(value)) return true;

  // eslint-disable-next-line prefer-const
  let [match, icon, title, text] = rgx.exec(value);

  icon = icon.trim();
  text = text.replace(/>(?:(\n)|(\s)?)/g, '$1').trim();
  title = title.trim();

  const style = {
    '📘': 'info',
    '⚠️': 'warn',
    '🚧': 'warn',
    '👍': 'okay',
    '✅': 'okay',
    '❗️': 'error',
    '🛑': 'error',
    ℹ️: 'info',
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

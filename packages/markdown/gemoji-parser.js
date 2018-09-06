// Inspiration from https://github.com/remarkjs/remark-gemoji/blob/01b33f7f1536e6491ff0aefe859695b2639594dc/index.js
const Emoji = require('./emojis.js').emoji;

const emojis = new Emoji();

const colon = ':';

function tokenize(eat, value, silent) {
  // Check if we’re at a short-code.
  if (value.charAt(0) !== colon) return false;

  const pos = value.indexOf(colon, 1);

  if (pos === -1) return false;

  const subvalue = value.slice(1, pos);

  // Exit with true in silent
  if (silent) return true;

  const match = colon + subvalue + colon;

  if (subvalue.substr(0, 3) === 'fa-') {
    return eat(match)({
      type: 'i',
      data: {
        hName: 'i',
        hProperties: {
          className: ['fa', subvalue],
        },
      },
    });
  }

  if (emojis.is(subvalue)) {
    return eat(match)({
      type: 'image',
      title: `:${subvalue}:`,
      alt: `:${subvalue}:`,
      url: `/img/emojis/${subvalue}.png`,
      data: {
        hProperties: {
          className: 'emoji',
          align: 'absmiddle',
          height: '20',
          width: '20',
        },
      },
    });
  }

  return false;
}

function locate(value, fromIndex) {
  return value.indexOf(colon, fromIndex);
}

tokenize.locator = locate;

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  tokenizers.gemoji = tokenize;

  methods.splice(methods.indexOf('text'), 0, 'gemoji');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  // This is for font awesome gemoji codes
  sanitizeSchema.attributes.i = ['className'];

  // This is for `emoji` class name
  sanitizeSchema.attributes.img.push('className');

  return parser;
};

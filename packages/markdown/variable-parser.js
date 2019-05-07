const { VARIABLE_REGEXP } = require('@mia-platform/variable');

function tokenizeVariable(eat, value, silent) {
  // Modifies the regular expression to match from
  // the start of the line
  const match = new RegExp(`^${VARIABLE_REGEXP}`).exec(value);

  if (!match) return false;

  if (silent) return true;

  // Escaped variables should just return the text
  if (match[0].startsWith('\\')) {
    return eat(match[0])({
      type: 'text',
      value: match[0].replace(/\\/g, ''),
    });
  }

  if (match[1].startsWith('glossary:')) {
    return eat(match[0])({
      type: 'readme-glossary-item',
      data: {
        hName: 'readme-glossary-item',
        hProperties: { term: match[1].replace('glossary:', '') },
      },
    });
  }

  return eat(match[0])({
    type: 'readme-variable',
    data: { hName: 'readme-variable', hProperties: { variable: match[1] } },
  });
}

function locate(value, fromIndex) {
  return value.indexOf('<<', fromIndex);
}

tokenizeVariable.locator = locate;

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  tokenizers.variable = tokenizeVariable;

  methods.splice(methods.indexOf('text'), 0, 'variable');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  // This is for our custom variable tags <<apiKey>>
  sanitizeSchema.tagNames.push('readme-variable');
  sanitizeSchema.attributes['readme-variable'] = ['variable'];

  // This is for our glossary variable tags <<glossary:item>>
  sanitizeSchema.tagNames.push('readme-glossary-item');
  sanitizeSchema.attributes['readme-glossary-item'] = ['term'];

  return parser;
};

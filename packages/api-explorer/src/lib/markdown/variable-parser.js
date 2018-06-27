function tokenizeVariable(eat, value, silent) {
  const match = /^<<([-\w:\s]+)>>/.exec(value);

  if (!match) {
    const escapedMatch = /^\\<<([-\w:]*?)\\>>/.exec(value);
    if (escapedMatch) {
      return eat(escapedMatch[0])({
        type: 'text',
        value: escapedMatch[0].replace(/\\/g, ''),
      });
    }
    return false;
  }

  if (silent) return true;

  if (match[1].startsWith('glossary:')) {
    return eat(match[0])({
      type: 'readme-glossary',
      data: { hName: 'readme-glossary', hProperties: { term: match[1].replace('glossary:', '') } },
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
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  tokenizers.variable = tokenizeVariable;

  methods.splice(methods.indexOf('text'), 0, 'variable');
}

module.exports = parser;

module.exports.sanitize = (sanitizeSchema) => {
  // This is for our custom variable tags <<apiKey>>
  sanitizeSchema.tagNames.push('readme-variable');
  sanitizeSchema.attributes['readme-variable'] = ['variable'];

  return parser;
}

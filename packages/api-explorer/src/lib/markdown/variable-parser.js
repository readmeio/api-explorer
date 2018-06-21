function tokenizeVariable(eat, value, silent) {
  const match = /^<<([-\w:]*?)>>/.exec(value);

  if (!match) return false;

  if (silent) return true;

  return eat(match[0])({
    type: 'readme-variable',
    data: { hName: 'readme-variable', hProperties: { variable: match[1] } },
  });
}

// TODO i'm not sure what this does?
function locateMention(value, fromIndex) {
  return value.indexOf('<<', fromIndex);
}

tokenizeVariable.locator = locateMention;

function parser() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  tokenizers.variable = tokenizeVariable;

  methods.splice(methods.indexOf('text'), 0, 'variable');
}

module.exports = parser;

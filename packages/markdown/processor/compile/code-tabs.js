module.exports = function CodeTabsCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;

  function compile(node) {
    return this.block(node).split('```\n\n').join('```\n');
  }
  visitors['code-tabs'] = compile;
};

module.exports = function CodeTabsCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;

  function codeTabs(node) {
    const md = this.block(node)
      .split('```\n\n')
      .join('```\n');
    return md;
  }
  visitors['code-tabs'] = codeTabs;
};

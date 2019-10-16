module.exports = function gap() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;

  function codeTabs(node) {
    return this.block(node).split('\n\n').join('\n');
  }

  visitors['code-tabs'] = codeTabs;
};

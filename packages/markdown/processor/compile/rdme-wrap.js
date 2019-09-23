module.exports = function gap() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;

  function rdmeWrap(node) {
    return this.block(node).split('\n\n').join('\n');
  }

  visitors['rdme-wrap'] = rdmeWrap;
};

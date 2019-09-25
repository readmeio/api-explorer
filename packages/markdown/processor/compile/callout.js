module.exports = function gap() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;

  function rdmeCallout(node) {
    console.log(this.block(node));
    return 'CALLOUT';
  }

  visitors['rdme-callout'] = rdmeCallout;
};

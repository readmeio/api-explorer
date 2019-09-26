/* div blocks directly alias the paragraph container; use for display only! */
module.exports = function div() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;
  visitors.div = function compiler(node) {
    return visitors.paragraph.call(this, node);
  };
};

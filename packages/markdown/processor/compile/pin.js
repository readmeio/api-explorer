/* div blocks directly alias the paragraph container; use for display only! */
module.exports = function DivCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;
  visitors.div = function compile(/* node */) {
    return 'PINNNED';
  };
};

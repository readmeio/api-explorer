module.exports = function TableHeadCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;
  visitors.tableHead = function compile(node) {
    return visitors.tableCell.call(this, node);
  };
};

module.exports = function gap() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;

  function rdmeFigure(node) {
    const self = this;
    
    // console.log({self, args: arguments});
    // // node.children.map(kid=> {});
    console.log()

    return this.block(node);
  }

  visitors['rdme-figure'] = rdmeFigure;
};

module.exports = function gap() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;

  function rdmeWrap(node) {
    const self = this;
    
    // console.log({self, args: arguments});
    // // node.children.map(kid=> {});
    // console.log(this.block(node))

    return self.block(node).split('\n\n').join('\n');
  }

  visitors['rdme-wrap'] = rdmeWrap;
};

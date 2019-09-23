module.exports = function CompileRdmeFigure() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;

  function rdmeFigure(node) {
    return ['<RdmeFigure>', this.block(node), '</RdmeFigure>'].join('\n\n');
  }

  visitors['rdme-figure'] = rdmeFigure;
};

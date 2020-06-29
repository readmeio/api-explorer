module.exports = function FigureCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;
  visitors.figure = function compile(node) {
    return `<figure>

${visitors.div.call(this, node)}

</figure>`;
  };
};

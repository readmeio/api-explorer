const nodeToString = require('hast-util-to-string');

module.exports = function FigureCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;

  visitors.figure = function figureCompiler(node) {
    const [image, caption] = node.children;
    return `<figure>

  ${visitors.image.call(this, image)}

  <figcaption>
    ${nodeToString(caption)}
  </figcaption>
</figure>`;
  };
};

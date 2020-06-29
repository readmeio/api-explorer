const nodeToString = require('hast-util-to-string');

module.exports = function FigureCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;

  visitors.figcaption = function figcaptionCompiler(node) {
    const caption = nodeToString(node);
    return `<figcaption>${caption}</figcaption>`;
  };

  visitors.figure = function figureCompiler(node) {
    const [image, caption] = node.children;
    return `<figure>

${visitors.image.call(this, image)}

${visitors.figcaption.call(this, caption)}
</figure>`;
  };
};

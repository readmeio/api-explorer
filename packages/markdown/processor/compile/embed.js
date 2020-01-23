module.exports = function EmbedCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;
  visitors.embed = function compile(node) {
    const { title, url, provider } = node.data;
    return `[${title}](${url} "${provider}")`;
  };
};

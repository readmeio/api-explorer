module.exports = function EmbedCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;
  visitors.embed = function compile(node) {
    // let block = this.block(node).replace(/\n/g, '\n> ');
    // block = `> ${block}`;
    // return block;

    const { title, url, provider } = node.data;
    return `[${title}](${url} "${provider}")`;
  };
};

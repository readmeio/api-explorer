function EmbedCompiler(node) {
  const { title, url } = node.data.hProperties;

  let { provider = '@embed' } = node.data.hProperties;
  provider = provider[0] === '@' ? provider : `@${provider}`;

  return `[${title || ''}](${url} "${provider}")`;
}

module.exports = function () {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;

  visitors.embed = EmbedCompiler;
};

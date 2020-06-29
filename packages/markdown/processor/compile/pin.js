module.exports = function PinCompiler() {
  const { Compiler } = this;
  const { visitors } = Compiler.prototype;
  function compiler(node) {
    return [`<div class="rdmd-pinned">`, this.block(node), `</div>`].join('\n\n');
  }
  visitors['rdme-pin'] = compiler;
};

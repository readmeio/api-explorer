module.exports = function callout() {
  const {Compiler} = this;
  const {visitors} = Compiler.prototype;
  visitors['rdme-callout'] = function rdmeCallout(node) {
    let block = this.block(node).replace(/\n/g, '\n> ');
    block = `> ${block}`;
    return block;
  };
};

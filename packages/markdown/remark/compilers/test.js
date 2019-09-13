module.exports = function gap() {
  const Compiler = this.Compiler
  const visitors = Compiler.prototype.visitors
  const original = visitors.heading

  function heading(node) {
    console.log({node, args: arguments, self: this, extract: {original, visitors, Compiler}})
    return (node.depth === 2 ? '\n' : '') + original.apply(this, arguments)
  }

  visitors.heading = heading
}
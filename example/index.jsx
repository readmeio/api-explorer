/* eslint-disable */
const React = require("react");
const ReactDOM = require("react-dom");
const SlateEditor = require("./editor").default;

const DOCBODY = require("./fixtures/markdown");
const Markdown = require("../packages/markdown");

function render(Component = "div", props = {}) {
  ReactDOM.render(<Component {...props} />, document.getElementById("root"));
}

const mdOpt = {
    correctnewlines: true,
    markdownOptions: {
      fences: true,
      commonmark: false,
      gfm: true
    }
  },
  style = {
    maxWidth: "42em",
    margin: "1em auto",
    padding: "0 1em"
  };

window.test = function test(){
  var
  AST = Markdown.render.ast('# Hello World', mdOpt),
  MDX = Markdown.render.md(AST, mdOpt);
  return {AST, MDX};
}

render(SlateEditor, {
  value: Markdown.render.dash(DOCBODY.magicBlocks, mdOpt),
  className: "markdown-body",
  style
});

// render('div', {
//   children: Markdown.render.dash(DOCBODY, mdOpt),
//   className: 'markdown-body',
//   style,
// });


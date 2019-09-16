/* eslint-disable */
const React = require("react");
const ReactDOM = require("react-dom");
const SlateEditor = require("./editor").default;

const DOCBODY = require("./fixtures/markdown");
const Markdown = require("../packages/markdown");

require('./editor/blocks');

function render(Component = "div", props = {}) {
  return ReactDOM.render(
    <Component {...props} />,
    document.getElementById("root")
  );
}

const mdOpt = {
    correctnewlines: true,
    markdownOptions: {
      fences: true,
      commonmark: true,
      gfm: true,
      ruleSpaces: false,
      listItemIndent: '1',
      spacedTable: false
    }
  },
  style = {
    maxWidth: "42em",
    margin: "1em auto",
    padding: "0 1em"
  };

const app = render(SlateEditor, {
  value: Markdown.render.dash(DOCBODY.magicBlocks, mdOpt),
  className: "markdown-body",
  style
});
window.app = app;
window.md = require("../packages/markdown");


// render('div', {
//   children: Markdown.render.dash(DOCBODY, mdOpt),
//   className: 'markdown-body',
//   style,
// });


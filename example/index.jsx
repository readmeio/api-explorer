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
      commonmark: true,
      gfm: true
    }
  },
  style = {
    maxWidth: "42em",
    margin: "1em auto",
    padding: "0 1em"
  };

render(SlateEditor, {
  value: Markdown.render.dash(DOCBODY, mdOpt),
  className: "markdown-body",
  style
});

// render('div', {
//   children: Markdown.render.dash(DOCBODY, mdOpt),
//   className: 'markdown-body',
//   style,
// });

window.TEST = () => {
  const { dash, hub, ast, md, html } = Markdown.render;
  const opts = {
    correctnewlines: true,
    markdownOptions: {
      fences: true,
      commonmark: true,
      gfm: true
    },
    settings: {
      position: false
    }
  };
  const text = `[block:unrecognized]
  {
    "color": "#f00",
    "title": "Title",
    "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
  }
  [/block]`;

  return ast(text, opts);
};

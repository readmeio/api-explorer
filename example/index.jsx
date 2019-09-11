/* eslint-disable */
const React = require('react');
const ReactDOM = require('react-dom');
const SlateEditor = require('./editor').default;

const DOCBODY = require('../packages/markdown/fixtures');
const Markdown = require('../packages/markdown');

function render(Component = 'div', props = {}) {
  ReactDOM.render(
    <Component {...props} />,
    document.getElementById('root')
  );
}

const 
mdOpt = {
  correctnewlines: true,
  markdownOptions: {
    fences: true,
    commonmark: true,
    gfm: true,
  }
},
style = {
  maxWidth: '42em',
  margin: '1em auto',
  padding: '0 1em',
};

console.dir(Markdown.render.ast(DOCBODY, mdOpt));

// render('div', {
//   children: Markdown.render.hub(DOCBODY, mdOpt),
//   className: 'markdown-body',
//   style,
// })

render(SlateEditor, {
  value: Markdown.render.markdown(DOCBODY, mdOpt),
  className: 'markdown-body',
  style,
});

// render(SlateEditor, {
//   value: Markdown.render.slate(DOCBODY, mdOpt),
//   className: 'markdown-body',
//   style,
// });


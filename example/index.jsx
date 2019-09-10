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

const style = {
  maxWidth: '42em',
  margin: '1em auto',
  padding: '0 1em',
};
// render('div', {
//   children: Markdown.render.hub(DOCBODY),
//   className: 'markdown-body',
//   style,
// })
render(SlateEditor, {
  value: Markdown.render.markdown(DOCBODY, {gfm: true}),
  className: 'markdown-body',
  style,
});

console.log(Markdown.render.TEST(DOCBODY))

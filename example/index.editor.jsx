/* eslint-disable */
const React = require('react');
const ReactDOM = require('react-dom');
const SlateEditor = require('./editor').default;
const Markdown = require('../packages/markdown');

// const DOCBODY = require('./fixtures/markdown');
const DOCBODY = {
  magic: require('./fixtures/markdown.magic').default,
  pure: require('./fixtures/markdown.pure').default,
  rdmd: {
    callouts: require('./fixtures/rdmd.callouts').default,
  }
};

window.Slate = require('slate'); // @todo remove this
require('./editor/blocks');

function render(Component = "div", props = {}) {
  return ReactDOM.render(
    <Component {...props} />,
    document.getElementById("root")
  );
}

const
value = DOCBODY.pure,
mdOpt = {
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

const loPair = require('lodash/fromPairs');
const query = loPair(location.search.split(/[\?\&]/).filter(s=> s).map(pair => pair.split('=')))

require('./editor/styles/main.scss')
let app;
switch (query.as) {
  case 'react': {
    app = render('div', {
      children: Markdown.render.hub(value, mdOpt),
      className: 'markdown-body',
      style,
    });      
    break;
  }
  default: {
    app = render(SlateEditor, {
      value: Markdown.render.ast(value, mdOpt),
      className: 'markdown-body',
      style,
      saveHandler: ast => {
        const md = Markdown.render.md(ast, Markdown.options);
      },
    });
    break;
  }
}
window.app = app;

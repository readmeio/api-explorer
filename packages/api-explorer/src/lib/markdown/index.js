const React = require('react');
const remark = require('remark');
const reactRenderer = require('remark-react');
const breaks = require('remark-breaks');

const variableParser = require('./variable-parser');
const sanitizeSchema = require('hast-util-sanitize/lib/github.json');

sanitizeSchema.tagNames.push('readme-variable');
sanitizeSchema.attributes['readme-variable'] = ['variable'];

sanitizeSchema.tagNames.push('input');
sanitizeSchema.ancestors.input = ['li'];

sanitizeSchema.protocols.href.push('doc', 'ref', 'blog', 'page');

const marked = require('marked');
const Emoji = require('./emojis.js').emoji;
const syntaxHighlighter = require('@readme/syntax-highlighter');
const sanitizer = require('./sanitizer');
const renderer = require('./renderer');

const emojis = new Emoji();

const Variable = require('../../Variable');

module.exports = function markdown(text, opts = {}) {
  marked.setOptions({
    sanitize: true,
    preserveNumbering: true,
    renderer,
    emoji(emojiText) {
      const emoji = emojiText.replace(/[^-_+a-zA-Z0-9]/g, '').toLowerCase();
      if (emoji.substr(0, 3) === 'fa-') {
        return `<i class="fa ${emoji}"></i>`;
      }
      if (emojis.is(emoji)) {
        return `<img src="/img/emojis/${emoji}.png" alt=":${emoji}+:" title=":${emoji}:" class="emoji" align="absmiddle" height="20" width="20">`;
      }
      return `:${emoji}:`;
    },
    highlight: syntaxHighlighter,
    gfm: true,
    breaks: !opts.correctnewlines,
    // By default we don't wanna strip any tags
    // so we use our sanitizer and not the built in
    // which just calls `escape()`
    sanitizer: opts.stripHtml ? undefined : sanitizer,
  });

  function heading(level) {
    return function (props) {
      const id = `section-${props.children[0].toLowerCase().replace(/[^\w]+/g, '-')}`
      return React.createElement(level, Object.assign({ className: 'header-scroll' }, props), [
        React.createElement('div', { className: 'anchor waypoint', id, key: `anchor-${id}` }),
        ...props.children,
        React.createElement('a', { className: 'fa fa-anchor', href: `#${id}`, key: `anchor-icon-${id}` })
      ]);
    }
  }

  // Nabbed from here:
  // https://github.com/readmeio/api-explorer/blob/0dedafcf71102feedaa4145040d3f57d79d95752/packages/api-explorer/src/lib/markdown/renderer.js#L52
  function href(href = '') {
    const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
    if (doc) {
      return `/docs/${doc[1]}`
    }

    const ref = href.match(/^ref:([-_a-zA-Z0-9#]*)$/);
    if (ref) {
      const cat = '';
      // TODO https://github.com/readmeio/api-explorer/issues/28
      // if (req && req.project.appearance.categoriesAsDropdown) {
      //   cat = `/${req._referenceCategoryMap[ref[1]]}`;
      // }
      return `/reference${cat}#${ref[1]}`;
    }

    const blog = href.match(/^blog:([-_a-zA-Z0-9#]*)$/);
    if (blog) {
      return `/blog/${blog[1]}`;
    }

    const custompage = href.match(/^page:([-_a-zA-Z0-9#]*)$/);
    if (custompage) {
      return `/page/${custompage[1]}`;
    }

    return href;
  }

  function docLink(href = '') {
    const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
    if (!doc) return false;

    return {
      className: 'doc-link',
      'data-sidebar': doc[1],
    };
  }

  return remark()
    .use(variableParser)
    .use(!opts.correctnewlines ? breaks : function () {})
    .use(reactRenderer, {
      sanitize: sanitizeSchema,
      remarkReactComponents: {
        'readme-variable': function({ variable }) {
          return React.createElement(Variable, {
            k: variable,
            value: [{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }],
            defaults: [],
            oauth: false,
          });
        },
        table: function({ children }) {
          return React.createElement('div', { className: 'marked-table' }, React.createElement('table', null, children));
        },
        h1: heading('h1'),
        h2: heading('h2'),
        h3: heading('h3'),
        h4: heading('h4'),
        h5: heading('h5'),
        h6: heading('h6'),
        a: function(props) {
          const doc = props.href && props.href.startsWith('doc:');
          return React.createElement('a', Object.assign({}, props, {
            target: '_self',
            href: href(props.href),
          }, docLink(props.href)));
        }
      },
    })
    .processSync(text).contents;

  return marked(text);
};

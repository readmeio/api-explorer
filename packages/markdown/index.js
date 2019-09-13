/* TODO
 - [ ] extract conversion from render (parse/processSync) methods
   (so you can get the AST or final text from any conversion)
 */
const React = require('react');
const unified = require('unified');
const sanitize = require('hast-util-sanitize/lib/github.json');
const Variable = require('@readme/variable');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const remarkParse = require('remark-parse');
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const rehypeReact = require('rehype-react');
const rehypeRemark = require('rehype-remark');
const remarkStringify = require('remark-stringify');
const breaks = require('remark-breaks');

const magicBlockParser = require('./remark/parsers/magic-block-parser');
const variableParser = require('./remark/parsers/variable-parser');
const gemojiParser = require('./remark/parsers/gemoji-parser');

const testCompiler = require('./remark/compilers/test');

const table = require('./components/Table');
const heading = require('./components/Heading');
const anchor = require('./components/Anchor');
const code = require('./components/Code');

// This is for checklists in <li>
sanitize.tagNames.push('input');
sanitize.ancestors.input = ['li'];

const GlossaryItem = require('./GlossaryItem');

/*
 * This is kinda complicated. Our "markdown" within ReadMe
 * can often not be just markdown, but also include regular HTML.
 *
 * In addition, we also have a few special markdown features
 * e.g. <<variables>>
 *
 * We use the https://github.com/unifiedjs/unified
 * to parse/transform and output React components.
 *
 * The order for this process goes like follows:
 * - Parse regular markdown
 * - Parse out our markdown add-ons using custom compilers
 * - Convert from a remark mdast (markdown ast) to a rehype hast (hypertext ast)
 * - Extract any raw HTML elements
 * - Sanitize and remove any disallowed attributes
 * - Output the hast to a React vdom with our custom components
 */
function parseMarkdown(text, opts = {}) {
  return unified()
    .use(remarkParse, opts.markdownOptions)
    .data('settings', opts.settings)
    .use(magicBlockParser.sanitize(sanitize))
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? breaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(rehypeSanitize);
}

// for backwards compatibility we have to
// export the Hub renderer as the default,
// but we will probably want to expose
// the ~parser~ by default going forwards.
module.exports = (text, opts) => module.exports.render.hub(text, opts);
module.exports.parse = parseMarkdown;

module.exports.render = {
  dash: (text, opts) =>
    !text
      ? null
      : parseMarkdown(text, opts)
        .use(rehypeReact, {
          createElement: React.createElement,
          components: {
            'readme-variable': Variable,
            'readme-glossary-item': GlossaryItem,
            // 'rdme-wrap': props => <div className="red" {...props} />,
            'rdme-wrap': props => React.createElement(React.Fragment, props),
          },
        })
        .parse(text), // .processSync(text).contents,

  hub: (text, opts) =>
    !text
      ? null
      : parseMarkdown(text, opts)
          .use(rehypeReact, {
            createElement: React.createElement,
            components: {
              'readme-variable': Variable,
              'readme-glossary-item': GlossaryItem,
              table: table(sanitize),
              h1: heading('h1', sanitize),
              h2: heading('h2', sanitize),
              h3: heading('h3', sanitize),
              h4: heading('h4', sanitize),
              h5: heading('h5', sanitize),
              h6: heading('h6', sanitize),
              a: anchor(sanitize),
              code: code(sanitize),
              div: props => React.createElement(React.Fragment, props),
            },
          })
          .processSync(text).contents,

  ast: (text, opts) =>
    !text
      ? null
      : parseMarkdown(text, opts)
        // .use(rehypeRemark)
        .use(remarkStringify)
        .parse(text),

  md: (tree, opts) =>
    !tree
      ? null
      : parseMarkdown('', opts)
        .use(remarkStringify)
        .use(testCompiler)
        .stringify(tree),

  html: (text, opts) =>
    !text
      ? null
      : parseMarkdown(text, opts)
        .use(rehypeStringify)
        .processSync(text).contents,
};

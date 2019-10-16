const React = require('react');
const unified = require('unified');
const sanitize = require('hast-util-sanitize/lib/github.json');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const remarkParse = require('remark-parse');
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const rehypeReact = require('rehype-react');
const remarkStringify = require('remark-stringify');
const breaks = require('remark-breaks');

const options = require('./processor/options.json');

const flavorCodeTabs = require('./processor/parse/flavored/code-tabs');
const flavorCallout = require('./processor/parse/flavored/callout');
const magicBlockParser = require('./processor/parse/magic-block-parser');
const variableParser = require('./processor/parse/variable-parser');
const gemojiParser = require('./processor/parse/gemoji-parser');

const rdmeDivCompiler = require('./processor/compile/div');
const codeTabsCompiler = require('./processor/compile/code-tabs');
const rdmeFigureCompiler = require('./processor/compile/rdme-figure');
const rdmeCalloutCompiler = require('./processor/compile/callout');

// This is for checklists in <li>
sanitize.tagNames.push('input');
sanitize.ancestors.input = ['li'];

// const Variable = require('@readme/variable');
// const GlossaryItem = require('./GlossaryItem');

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
function parseMarkdown(opts = {}) {
  return unified()
    .use(remarkParse, opts.markdownOptions)
    .data('settings', opts.settings)
    .use(magicBlockParser.sanitize(sanitize))
    .use([
      flavorCodeTabs,
      flavorCallout.sanitize(sanitize),
    ])
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? breaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(rehypeSanitize);
}

// for backwards compatibility we have to
// export the Hub renderer as the default
// but we'll probably want to expose the
// processor by default in the future.
module.exports = (text, opts) => module.exports.render.hub(text, opts);

module.exports.parse = parseMarkdown;

module.exports.options = options; /** @todo: make exporting default options more coherent */

module.exports.render = {
  dash: (text, opts) =>
    !text
      ? null
      : parseMarkdown(opts)
          .use(rehypeReact, {
            createElement: React.createElement,
            components: {
              'readme-variable': props => <span style={{color:'red'}}>Variable</span>,
              'readme-glossary-item': props => <span style={{color:'red'}}>Term</span>,
              // div: props => React.createElement(React.Fragment, props),
            },
          })
          .parse(text), // .processSync(text).contents,

  hub: (text, opts) => {
    const callout = require('./components/Callout');
    const codeTabs = require('./components/CodeTabs');
    const table = require('./components/Table');
    const anchor = require('./components/Anchor');
    const code = require('./components/Code');
    return !text
      ? null
      : parseMarkdown(opts)
          .use(rehypeReact, {
            createElement: React.createElement,
            components: {
              'code-tabs': codeTabs(sanitize),
              'rdme-callout': callout(sanitize),
              'readme-variable': props => <span style={{color:'red'}} {...props}>Variable</span>,
              'readme-glossary-item': props => <span style={{color:'red'}} {...props}>Term</span>,
              table: table(sanitize),
              a: anchor(sanitize),
              code: code(sanitize),
              img: props => {
                const [
                  title,
                  align,
                  width='auto',
                  height='auto'
                ] = props.title ? props.title.split(', ') : [];
                const extras = {title, align, width, height};

                return <img {...props} {...extras} />;
              },
              div: props => React.createElement(React.Fragment, props),
            },
          })
          .processSync(text).contents;
  },

  ast: (text, opts) =>
    !text
      ? null
      : parseMarkdown(opts)
          // .use(rehypeRemark)
          .use(remarkStringify, opts.markdownOptions)
          .parse(text),

  md: (tree, opts) =>
    !tree
      ? null
      : parseMarkdown(opts)
          .use(remarkStringify, opts.markdownOptions)
          .use([
            rdmeDivCompiler,
            codeTabsCompiler,
            rdmeFigureCompiler,
            rdmeCalloutCompiler
          ])
          .stringify(tree),

  html: (text, opts) =>
    !text
      ? null
      : parseMarkdown(opts)
          .use(rehypeStringify)
          .processSync(text).contents,
};

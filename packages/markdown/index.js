const React = require('react');
const unified = require('unified');

/* Unified Plugins
*/
const sanitize = require('hast-util-sanitize/lib/github.json');

// sanitization schema
sanitize.tagNames.push('input'); // allow GitHub-style todo lists
sanitize.ancestors.input = ['li'];

// remark plugins
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const remarkParse = require('remark-parse');
const remarkStringify = require('remark-stringify');
const breaks = require('remark-breaks');

// rehype plugins
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const rehypeReact = require('rehype-react');

/* React Custom Components
 */ 
const Variable = require('@readme/variable');
const GlossaryItem = require('./GlossaryItem');
const Code = require('./components/Code');
const Table = require('./components/Table');
const Anchor = require('./components/Anchor');
// const Callout = require('./components/Callout'); // breaks CSS when required from the file scope; see line 90
const CodeTabs = require('./components/CodeTabs');

/* Custom Unified Parsers
 */ 
const flavorCodeTabs = require('./processor/parse/flavored/code-tabs');
const flavorCallout = require('./processor/parse/flavored/callout');
const magicBlockParser = require('./processor/parse/magic-block-parser');
const variableParser = require('./processor/parse/variable-parser');
const gemojiParser = require('./processor/parse/gemoji-parser');

/* Custom Unified Compilers
 */ 
const rdmeDivCompiler = require('./processor/compile/div');
const codeTabsCompiler = require('./processor/compile/code-tabs');
const rdmeCalloutCompiler = require('./processor/compile/callout');

// Default Unified Options
const options = require('./processor/options.json');

function parseMarkdown(opts = {}) {
  /*
   * This is kinda complicated: "markdown" within ReadMe is
   * often more than just markdown. It can also include HTML,
   * as well as custom syntax constructs such as <<variables>>,
   * and other special features.
   *
   * We use the Unified text processor to parse and transform
   * Markdown to various output formats, such as a React component
   * tree. (See https://github.com/unifiedjs/unified for more info.)
   *
   * The order for processing ReadMe-flavored markdown is as follows:
   * - parse markdown
   * - parse custom syntaxes add-ons using custom compilers
   * - convert from a remark mdast (markdown ast) to a rehype hast (hypertext ast)
   * - extract any raw HTML elements
   * - sanitize and remove any disallowed attributes
   * - output the hast to a React vdom with our custom components
   */
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


function hub(text, opts) {
  if (!text) return null;

  const Callout = require('./components/Callout'); // @todo fix callout heading CSS bug; see line 31

  return parseMarkdown(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      components: {
        'code-tabs': CodeTabs(sanitize),
        'rdme-callout': Callout(sanitize),
        'readme-variable': Variable(sanitize),
        'readme-glossary-item': GlossaryItem(sanitize),
        table: Table(sanitize),
        a: Anchor(sanitize),
        code: Code(sanitize),
        img: props => {
          // @todo refactor this in to own component
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
}

function dash(text, opts) {
  if (!text) return null;

  return parseMarkdown(opts)
  .use(rehypeReact, {
    createElement: React.createElement,
    components: {
      'readme-variable': props => <span {...props}>Variable</span>,
      'readme-glossary-item': props => <span {...props}>Term</span>,
      // div: props => React.createElement(React.Fragment, props),
    },
  })
  .parse(text);
}

function ast(text, opts) {
  if (!text) return null;

  return parseMarkdown(opts)
    .use(remarkStringify, opts.markdownOptions)
    .parse(text);
}

function md(tree, opts) {
  if (!tree) return null;

  return parseMarkdown(opts)
    .use(remarkStringify, opts.markdownOptions)
    .use([
      rdmeDivCompiler,
      codeTabsCompiler,
      rdmeCalloutCompiler
    ])
    .stringify(tree);
}

function html(text, opts) {
  if (!text) return null;

  return parseMarkdown(opts)
    .use(rehypeStringify)
    .processSync(text).contents;
}

module.exports = (text, opts) => hub(text, opts); // exports as default for backwards "compatibility"

Object.assign(module.exports, {
  hub,
  dash,
  ast,
  md,
  html,
  options,
  parse: parseMarkdown,
  VariablesContext: Variable.VariablesContext,
});

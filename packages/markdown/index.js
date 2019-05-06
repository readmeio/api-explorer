const React = require('react');
const unified = require('unified');
const sanitize = require('hast-util-sanitize/lib/github.json');
const Variable = require('@mia-platform/variable');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const remarkParse = require('remark-parse');
const rehypeSanitize = require('rehype-sanitize');
const rehypeReact = require('rehype-react');
const breaks = require('remark-breaks');

const variableParser = require('./variable-parser');
const gemojiParser = require('./gemoji-parser');

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
module.exports = function markdown(text, opts = {}) {
  if (!text) return null;

  return unified()
    .use(remarkParse)
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? breaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(rehypeSanitize)
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
        a: anchor(opts.baseUrl, sanitize),
        code: code(sanitize),
        // Remove enclosing <div>
        // https://github.com/mapbox/remark-react/issues/54
        div: props => React.createElement(React.Fragment, props),
      },
    })
    .processSync(text).contents;
};

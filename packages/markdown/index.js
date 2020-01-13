require('./styles/main.scss');

const React = require('react');
const unified = require('unified');

/* Unified Plugins
 */
const sanitize = require('hast-util-sanitize/lib/github.json');

// remark plugins
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const remarkParse = require('remark-parse');
const remarkStringify = require('remark-stringify');
const remarkBreaks = require('remark-breaks');

// rehype plugins
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const rehypeReact = require('rehype-react');

/* React Custom Components
 */
const DivFragment = props => React.createElement(React.Fragment, props);

const Variable = require('@readme/variable');
const GlossaryItem = require('./components/GlossaryItem');
const Code = require('./components/Code');
const Table = require('./components/Table');
const Anchor = require('./components/Anchor');
const Heading = require('./components/Heading');
const Callout = require('./components/Callout');
const CodeTabs = require('./components/CodeTabs');
const Image = require('./components/Image');
const Embed = require('./components/Embed');

/* Custom Unified Parsers
 */
const flavorCodeTabs = require('./processor/parse/flavored/code-tabs');
const flavorCallout = require('./processor/parse/flavored/callout');
const flavorEmbed = require('./processor/parse/flavored/embed');
const magicBlockParser = require('./processor/parse/magic-block-parser');
const variableParser = require('./processor/parse/variable-parser');
const gemojiParser = require('./processor/parse/gemoji-parser');

/* Custom Unified Compilers
 */
const rdmeDivCompiler = require('./processor/compile/div');
const codeTabsCompiler = require('./processor/compile/code-tabs');
const rdmeEmbedCompiler = require('./processor/compile/embed');
const rdmeVarCompiler = require('./processor/compile/var');
const rdmeCalloutCompiler = require('./processor/compile/callout');

// Processor Option Defaults
const options = require('./processor/options.json');

// Sanitization Schema Defaults
sanitize.clobberPrefix = '';

sanitize.tagNames.push('embed');
sanitize.attributes.embed = ['url', 'provider', 'html', 'title', 'href'];

sanitize.tagNames.push('rdme-embed');
sanitize.attributes['rdme-embed'] = ['url', 'provider', 'html', 'title', 'href'];

sanitize.attributes.a = ['href', 'title'];

sanitize.tagNames.push('figure');
sanitize.tagNames.push('figcaption');

sanitize.tagNames.push('input'); // allow GitHub-style todo lists
sanitize.ancestors.input = ['li'];

/**
 * Normalize Magic Block Raw Text
 */
export function normalize(blocks) {
  // normalize magic block lines
  // eslint-disable-next-line no-param-reassign
  blocks = blocks
    .replace(/\[block:/g, '\n[block:')
    .replace(/\[\/block\]/g, '[/block]\n')
    .trim()
    .replace(/^(#+)(.+)/gm, '$1 $2');
  return `${blocks}\n\n&nbsp;`;
}

export const utils = {
  options,
  normalizeMagic: normalize,
  VariablesContext: Variable.VariablesContext,
  GlossaryContext: GlossaryItem.GlossaryContext,
};

/**
 * Core markdown text processor
 */
function parseMarkdown(opts = {}) {
  /*
   * This is kinda complicated: "markdown" within ReadMe is
   * often more than just markdown. It can also include HTML,
   * as well as custom syntax constructs such as <<variables>>,
   * and other special features.
   *
   * We use the Unified text processor to parse and transform
   * Markdown to various output formats, such as a React component
   * tree. (See https://github.com/unifiedjs/unified for more.)
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
      flavorCodeTabs.sanitize(sanitize),
      flavorCallout.sanitize(sanitize),
      flavorEmbed.sanitize(sanitize),
    ])
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? remarkBreaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(rehypeSanitize);
}

export function plain(text, opts = options) {
  if (!text) return null;
  return parseMarkdown(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      components: {
        // 'readme-variable': props => <span {...props}>Variable</span>,
        // 'readme-glossary-item': props => <span {...props}>Term</span>,
        // 'readme-variable': Variable(sanitize),
        // 'readme-glossary-item': GlossaryItem(sanitize),
        div: DivFragment,
      },
    })
    .processSync(text).contents;
}

/**
 *  return a React VDOM component tree
 */
export function react(text, opts = options) {
  if (!text) return null;
  return parseMarkdown(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      components: {
        'code-tabs': CodeTabs(sanitize),
        'rdme-callout': Callout(sanitize),
        'readme-variable': Variable,
        'readme-glossary-item': GlossaryItem,
        'rdme-embed': Embed(sanitize),
        table: Table(sanitize),
        a: Anchor(sanitize),
        h1: Heading(1),
        h2: Heading(2),
        h3: Heading(3),
        h4: Heading(4),
        h5: Heading(5),
        h6: Heading(6),
        code: Code(sanitize),
        img: Image(sanitize),
        div: DivFragment,
      },
    })
    .processSync(text).contents;
}

/**
 *  transform markdown in to HTML
 */
export function html(text, opts = options) {
  if (!text) return null;

  return parseMarkdown(opts)
    .use(rehypeStringify)
    .processSync(text).contents;
}

/**
 *  convert markdown to an mdast object
 */
export function ast(text, opts = options) {
  if (!text) return null;
  return parseMarkdown(opts)
    .use(remarkStringify, opts.markdownOptions)
    .parse(text);
}

/**
 *  compile mdast to ReadMe-flavored markdown
 */
export function md(tree, opts = options) {
  if (!tree) return null;
  return parseMarkdown(opts)
    .use(remarkStringify, opts.markdownOptions)
    .use([
      rdmeDivCompiler,
      codeTabsCompiler,
      rdmeCalloutCompiler,
      rdmeEmbedCompiler,
      rdmeVarCompiler,
    ])
    .stringify(tree);
}

const ReadMeMarkdown = text => react(normalize(text));

export default ReadMeMarkdown;

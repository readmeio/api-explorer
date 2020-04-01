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
const Variable = require('@readme/variable');
const { GlossaryItem, Code, Table, Anchor, Heading, Callout, CodeTabs, Image, Embed } = require('./components');

/* Custom Unified Parsers
 */
const {
  flavorCodeTabs,
  flavorCallout,
  flavorEmbed,
  magicBlockParser,
  variableParser,
  gemojiParser,
} = require('./processor/parse');

/* Custom Unified Compilers
 */
const {
  rdmeDivCompiler,
  codeTabsCompiler,
  rdmeEmbedCompiler,
  rdmeVarCompiler,
  rdmeCalloutCompiler,
  rdmePinCompiler,
} = require('./processor/compile');

// Processor Option Defaults
const options = require('./options.json');

// Sanitization Schema Defaults
sanitize.clobberPrefix = '';

sanitize.tagNames.push('span');
sanitize.attributes['*'].push('class', 'className', 'align');

sanitize.tagNames.push('rdme-pin');

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
    .replace(/\[block:/g, '\n\n[block:')
    .replace(/\[\/block\]/g, '[/block]\n')
    .trim()
    .replace(/^(#+)(.+\n\n)/gm, '$1 $2');
  return `${blocks}\n\n `;
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
export function processor(opts = {}) {
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
    .use([flavorCodeTabs.sanitize(sanitize), flavorCallout.sanitize(sanitize), flavorEmbed.sanitize(sanitize)])
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? remarkBreaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitize);
}

export function plain(text, opts = options, components = {}) {
  if (!text) return null;
  return processor(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components,
    })
    .processSync(opts.normalize ? normalize(text) : text).contents;
}

/**
 *  return a React VDOM component tree
 */
export function react(text, opts = options, components = {}) {
  if (!text) return null;

  // eslint-disable-next-line react/prop-types
  const PinWrap = ({ children }) => <div className="pin">{children}</div>;
  const count = {};

  return processor(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: (typeof components === 'function' ? components : r => r)({
        'code-tabs': CodeTabs(sanitize),
        'rdme-callout': Callout(sanitize),
        'readme-variable': Variable,
        'readme-glossary-item': GlossaryItem,
        'rdme-embed': Embed(sanitize),
        'rdme-pin': PinWrap,
        table: Table(sanitize),
        a: Anchor(sanitize),
        h1: Heading(1, count),
        h2: Heading(2, count),
        h3: Heading(3, count),
        h4: Heading(4, count),
        h5: Heading(5, count),
        h6: Heading(6, count),
        code: Code(sanitize),
        img: Image(sanitize),
        ...components,
      }),
    })
    .processSync(opts.normalize ? normalize(text) : text).contents;
}

/**
 *  transform markdown in to HTML
 */
export function html(text, opts = options) {
  if (!text) return null;

  return processor(opts)
    .use(rehypeStringify)
    .processSync(opts.normalize ? normalize(text) : text).contents;
}

/**
 *  convert markdown to an mdast object
 */
export function ast(text, opts = options) {
  if (!text) return null;
  return processor(opts)
    .use(remarkStringify, opts.markdownOptions)
    .parse(opts.normalize ? normalize(text) : text);
}

/**
 *  compile mdast to ReadMe-flavored markdown
 */
export function md(tree, opts = options) {
  if (!tree) return null;
  return processor(opts)
    .use(remarkStringify, opts.markdownOptions)
    .use([rdmeDivCompiler, codeTabsCompiler, rdmeCalloutCompiler, rdmeEmbedCompiler, rdmeVarCompiler, rdmePinCompiler])
    .stringify(tree);
}

const ReadMeMarkdown = text => react(normalize(text));

export default ReadMeMarkdown;

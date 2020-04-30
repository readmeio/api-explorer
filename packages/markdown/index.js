/* eslint-disable no-param-reassign */
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
const remarkSlug = require('remark-slug');

// rehype plugins
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const rehypeReact = require('rehype-react');

/* React Custom Components
 */
const BaseUrlContext = require('./contexts/BaseUrl');

const Variable = require('@readme/variable');
const {
  GlossaryItem,
  Code,
  Table,
  Anchor,
  Heading,
  Callout,
  CodeTabs,
  Image,
  Embed,
  HTMLBlock,
} = require('./components');

/* Custom Unified Parsers
 */
const {
  flavorCodeTabs,
  flavorCallout,
  flavorEmbed,
  magicBlockParser,
  variableParser,
  gemojiParser,
  compactHeadings,
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

/* Custom Unified Plugins
 */
const sectionAnchorId = require('./processor/plugin/section-anchor-id');

// Processor Option Defaults
const options = require('./options.json');

// Sanitization Schema Defaults
sanitize.clobberPrefix = '';

sanitize.tagNames.push('span', 'style', 'pre');
sanitize.attributes['*'].push('class', 'className', 'align', 'style');

sanitize.tagNames.push('rdme-pin');

sanitize.attributes.pre = ['class', 'className']

sanitize.tagNames.push('embed');
sanitize.attributes.embed = ['url', 'provider', 'html', 'title', 'href'];

sanitize.tagNames.push('rdme-embed');
sanitize.attributes['rdme-embed'] = ['url', 'provider', 'html', 'title', 'href', 'iframe', 'width', 'height'];

sanitize.attributes.a = ['href', 'title', 'class', 'className'];

sanitize.tagNames.push('figure');
sanitize.tagNames.push('figcaption');

sanitize.tagNames.push('input'); // allow GitHub-style todo lists
sanitize.ancestors.input = ['li'];

/**
 * Normalize Magic Block Raw Text
 */
function setup(blocks, opts = {}) {
  // merge default and user options
  opts = { ...options, ...opts };

  // normalize magic block linebreaks
  if (opts.normalize && blocks) {
    blocks = blocks
      .replace(/\[block:/g, '\n\n[block:')
      .replace(/\[\/block\]/g, '[/block]\n')
      .trim();
  }

  return [`${blocks}\n\n `, opts];
}

export const utils = {
  options,
  BaseUrlContext,
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
    .use(compactHeadings.sanitize(sanitize))
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? remarkBreaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(remarkSlug)
    .use(sectionAnchorId)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitize);
}

export function plain(text, opts = {}, components = {}) {
  if (!text) return null;
  [text, opts] = setup(text, opts);

  return processor(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components,
    })
    .processSync(text).contents;
}

/**
 *  return a React VDOM component tree
 */
export function react(text, opts = {}, components = {}) {
  if (!text) return null;
  [text, opts] = setup(text, opts);

  // eslint-disable-next-line react/jsx-props-no-spreading, react/prop-types
  const Pre = ({ children, ...attr }) => <pre {...attr}>{children}</pre>;

  // eslint-disable-next-line react/prop-types
  const PinWrap = ({ children }) => <div className="pin">{children}</div>;

  return processor(opts)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: (typeof components === 'function' ? components : r => r)({
        'code-tabs': CodeTabs(sanitize),
        'html-block': HTMLBlock(sanitize),
        'rdme-callout': Callout(sanitize),
        'readme-variable': Variable,
        'readme-glossary-item': GlossaryItem,
        'rdme-embed': Embed(sanitize),
        'rdme-pin': PinWrap,
        table: Table(sanitize),
        a: Anchor(sanitize),
        h1: Heading(1),
        h2: Heading(2),
        h3: Heading(3),
        h4: Heading(4),
        h5: Heading(5),
        h6: Heading(6),
        pre: Pre,
        code: Code(sanitize),
        img: Image(sanitize),
        ...components,
      }),
    })
    .processSync(text).contents;
}

/**
 *  transform markdown in to HTML
 */
export function html(text, opts = {}) {
  if (!text) return null;
  [text, opts] = setup(text, opts);

  return processor(opts).use(rehypeStringify).processSync(text).contents;
}

/**
 *  convert markdown to an hast object
 */
export function hast(text, opts = {}) {
  if (!text) return null;
  [text, opts] = setup(text, opts);

  const rdmd = processor(opts);
  const node = rdmd.parse(text);
  return rdmd.runSync(node);
}

/**
 *  convert markdown to an mdast object
 */
export function mdast(text, opts = {}) {
  if (!text) return null;
  [text, opts] = setup(text, opts);

  return processor(opts).parse(text);
}

/**
 *  compile mdast to ReadMe-flavored markdown
 */
export function md(tree, opts = {}) {
  if (!tree) return null;
  [, opts] = setup('', opts);

  return processor(opts)
    .use(remarkStringify, opts.markdownOptions)
    .use([rdmeDivCompiler, codeTabsCompiler, rdmeCalloutCompiler, rdmeEmbedCompiler, rdmeVarCompiler, rdmePinCompiler])
    .stringify(tree);
}

const ReadMeMarkdown = (text, opts = {}) => react(text, opts);

export default ReadMeMarkdown;

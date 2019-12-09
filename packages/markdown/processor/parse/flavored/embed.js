const rgx = /^\[([\w ]*)\]\((\S*) ["'](\@\w*)"\)/;

function tokenizer(eat, value) {
  if (!rgx.test(value)) return true;

  // eslint-disable-next-line prefer-const
  let [match, title, url, provider] = rgx.exec(value);

  return eat(match)({
    type: 'embed',
    title,
    url,
    provider,
    data: {
      title,
      url,
      provider,
      hProperties: { title, url, provider },
      hName: 'rdme-embed',
    },
    children: [
      {
        type: 'link',
        url,
        title: provider,
        children: [{ type: 'text', value: title }],
      },
    ],
  });
}

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.embed = tokenizer;
  methods.splice(methods.indexOf('newline'), 0, 'embed');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;
  const attr = sanitizeSchema.attributes;

  tags.push('embed');
  attr.embed = [...attr.embed];

  return parser;
};

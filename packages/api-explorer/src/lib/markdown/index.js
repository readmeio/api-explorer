const marked = require('marked');
const Emoji = require('./emojis.js').emoji;
const syntaxHighlighter = require('@readme/syntax-highlighter');
const sanitizer = require('./sanitizer');
const renderer = require('./renderer');

const emojis = new Emoji();

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
  return marked(text);
};

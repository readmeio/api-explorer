const magic = require('./magic');
const markdown = require('./markdown');

module.exports = {
  magic,
  markdown,
  TESTING() {
    const concat = Object.keys(MDFXT).map(key => {
      const ttl = `## ${key.toUpperCase()}\n`;
      const sub = Object.entries((MDFXT[key]))
        .map(([k, v]) => `\n### ${key.toUpperCase()} ${k.toUpperCase()}S\n\n${v.trim()}\n`)
        .join('\n')
      return ttl + sub;
    });

    return ["# ReadMe Markdown: Test Fixtures", ...concat].join('\n\n');
  },
};

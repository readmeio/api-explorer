const codemirror = require('./codemirror');

function sanitizeCode(code) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return String(code).replace(/[&<>"'/]/g, s => entityMap[s]);
}

module.exports = (code, lang/* , dark */) => {
  if (lang === 'text') {
    return sanitizeCode(code);
  }

  const theme = 'cm-s-tomorrow-night';
  // let theme = 'cm-s-neo';
  // if (dark) {
  //   theme = 'cm-s-tomorrow-night';
  // }

  // const modes = {
  //   html: 'htmlmixed',
  //   json: ['javascript', 'application/ld+json'],
  //   text: ['null', 'text/plain'],
  //   markdown: 'gfm',
  //   stylus: 'scss',
  //   bash: 'shell',
  //   mysql: 'sql',
  //   sql: ['sql', 'text/x-sql'],
  //   curl: 'shell',
  //   asp: 'clike',
  //   csharp: ['clike', 'text/x-csharp'],
  //   cplusplus: ['clike', 'text/x-c++src'],
  //   c: 'clike',
  //   java: ['clike', 'text/x-java'],
  //   scala: ['clike', 'text/x-scala'],
  //   objectivec: ['clike', 'text/x-objectivec'],
  //   liquid: 'htmlmixed',
  //   scss: 'css',
  // };

  // let mode = lang;

  // if (mode in modes) {
  //   mode = modes[mode];
  //   lang = mode;
  //   if (_.isArray(mode)) {
  //     lang = mode[0];
  //     mode = mode[1];
  //   }
  // }

  // let highlighted = ;

  // // Kind of a hack, but no other way to sanitize angular code
  // // Can't use ng-non-bindable because of jwt variables
  // highlighted = highlighted.replace(/{{/g, '&#123;<span></span>&#123;');
  // highlighted = highlighted.replace(/}}/g, '&#125;<span></span>&#125;');

  return `<span class="${theme}">${codemirror(code, lang)}</span>`;
};


module.exports.uppercase = require('./uppercase');

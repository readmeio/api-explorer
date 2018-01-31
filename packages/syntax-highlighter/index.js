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

module.exports = (code, lang, dark) => {
  if (lang === 'text') {
    return sanitizeCode(code);
  }

  const theme = dark ? 'cm-s-tomorrow-night' : 'cm-s-neo';

  const modes = {
    html: 'htmlmixed',
    json: 'application/ld+json',
    text: 'text/plain',
    markdown: 'gfm',
    stylus: 'scss',
    bash: 'shell',
    mysql: 'sql',
    sql: 'text/x-sql',
    curl: 'shell',
    asp: 'clike',
    csharp: 'text/x-csharp',
    cplusplus: 'text/x-c++src',
    c: 'clike',
    java: 'text/x-java',
    scala: 'text/x-scala',
    objectivec: 'text/x-objectivec',
    liquid: 'htmlmixed',
    scss: 'css',
  };

  // let highlighted = ;

  // // Kind of a hack, but no other way to sanitize angular code
  // // Can't use ng-non-bindable because of jwt variables
  // highlighted = highlighted.replace(/{{/g, '&#123;<span></span>&#123;');
  // highlighted = highlighted.replace(/}}/g, '&#125;<span></span>&#125;');

  return `<span class="${theme}">${codemirror(code, modes[lang] ? modes[lang] : lang)}</span>`;
};


module.exports.uppercase = require('./uppercase');

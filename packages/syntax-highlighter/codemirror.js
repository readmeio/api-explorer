const CodeMirror = require('codemirror');
require('codemirror/addon/runmode/runmode');
require('codemirror/mode/meta.js');

require('codemirror/mode/shell/shell');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/ruby/ruby');
require('codemirror/mode/python/python');
require('codemirror/mode/clike/clike');
require('codemirror/mode/htmlmixed/htmlmixed');

function esc(str) {
  return str.replace(/[<&]/g, ch => (ch === '&' ? '&amp;' : '&lt;'));
}

// This is a mapping of potential languages
// that do not have a direct codemirror mode for them
// so we need to do a lookup to see what the appropriate
// mode is.
//
// There are 2 types of lookup, single and array.
// e.g. `html` needs to be rendered using `htmlmixed`, but
// `java`, needs to be rendered using the `clike` mode.
//
// We also have the mimeType to potentially in future load
// in new types dynamically
const modes = {
  html: 'htmlmixed',
  json: ['javascript', 'application/ld+json'],
  text: ['null', 'text/plain'],
  markdown: 'gfm',
  stylus: 'scss',
  bash: 'shell',
  mysql: 'sql',
  sql: ['sql', 'text/x-sql'],
  curl: 'shell',
  asp: 'clike',
  csharp: ['clike', 'text/x-csharp'],
  cplusplus: ['clike', 'text/x-c++src'],
  c: 'clike',
  java: ['clike', 'text/x-java'],
  scala: ['clike', 'text/x-scala'],
  objectivec: ['clike', 'text/x-objectivec'],
  kotlin: ['clike', 'text/x-kotlin'],
  liquid: 'htmlmixed',
  scss: 'css',
};

function getMode(lang) {
  let mode = lang;

  if (mode in modes) {
    mode = modes[mode];
    // lang = mode;
    if (Array.isArray(mode)) {
      // lang = mode[0];
      mode = mode[1];
    }
  }

  return mode;
}

module.exports = (code, lang) => {
  let output = '';
  const mode = getMode(lang);

  // TODO https://github.com/readmeio/api-explorer/issues/101
  // CodeMirror.modeInfo.forEach((info) => {
  //   if (info.mime == lang) {
  //     modeName = info.mode;
  //   } else if (info.name.toLowerCase() === lang) {
  //     modeName = info.mode;
  //     lang = info.mime;
  //   }
  // });
  // if (!CodeMirror.modes[lang]) {
  //   require(`codemirror/mode/${lang}/${lang}.js`);
  // }

  let curStyle = null;
  let accum = '';
  function flush() {
    accum = esc(accum);
    if (curStyle) {
      output += `<span class="${curStyle.replace(/(^|\s+)/g, '$1cm-')}">${accum}</span>`;
    } else {
      output += accum;
    }
  }

  CodeMirror.runMode(code, mode, (text, style) => {
    if (style !== curStyle) {
      flush();
      curStyle = style;
      accum = text;
    } else {
      accum += text;
    }
  });
  flush();

  return output;
};

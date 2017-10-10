const CodeMirror = require('codemirror');
require('codemirror/addon/runmode/runmode');
require('codemirror/mode/meta.js');

require('codemirror/mode/shell/shell');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/ruby/ruby');
require('codemirror/mode/python/python');


function esc(str) {
  return str.replace(/[<&]/g, ch => (ch === '&' ? '&amp;' : '&lt;'));
}

module.exports = (code, lang) => {
  let output = '';

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

  CodeMirror.runMode(code, lang, (text, style) => {
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

const CodeMirror = require('codemirror');
const React = require('react');
const Variable = require('@readme/variable');

const { VARIABLE_REGEXP } = Variable;

require('codemirror/addon/runmode/runmode');
require('codemirror/mode/meta.js');

require('codemirror/mode/shell/shell');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/ruby/ruby');
require('codemirror/mode/python/python');
require('codemirror/mode/clike/clike');
require('codemirror/mode/htmlmixed/htmlmixed');

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

module.exports = (code, lang, opts = { tokenizeVariables: false }) => {
  const output = [];
  let key = 0;
  const mode = getMode(lang);

  function tokenizeVariable(value) {
    // Modifies the regular expression to match anything
    // before or after like quote characters: ' "
    const match = new RegExp(`(.*)${VARIABLE_REGEXP}(.*)`).exec(value);

    if (!match) return value;

    // eslint-disable-next-line no-plusplus
    return [match[1], <Variable key={++key} variable={match[2]} />, match[3]];
  }

  let curStyle = null;
  let accum = '';
  function flush() {
    accum = opts.tokenizeVariables ? tokenizeVariable(accum) : accum;
    if (curStyle) {
      output.push(
        // eslint-disable-next-line no-plusplus
        <span key={++key} className={`${curStyle.replace(/(^|\s+)/g, '$1cm-')}`}>
          {accum}
        </span>,
      );
    } else {
      output.push(accum);
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

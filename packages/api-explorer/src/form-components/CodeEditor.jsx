const PropTypes = require('prop-types');

const syntaxHighlighter =
  typeof window !== 'undefined' ? require('@readme/syntax-highlighter/dist/index.js').default : () => {};

function CodeEditor(props) {
  const { code, onChange } = props;

  return syntaxHighlighter(
    code,
    'json',
    {
      editable: true,
      dark: false,
    },
    {
      onChange: (editor, data, value) => {
        return onChange(value);
      },
    }
  );
}

CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function createCodeEditor() {
  return CodeEditor;
}

module.exports = createCodeEditor;

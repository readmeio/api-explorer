const React = require('react');
const PropTypes = require('prop-types');

const syntaxHighlighter =
  typeof window !== 'undefined' ? require('@readme/syntax-highlighter/dist/index.js').default : () => {};

function CodeEditor(props) {
  const { code, dirty, onChange } = props;

  return (
    <React.Fragment key={`codeeditor-${dirty}`}>
      {syntaxHighlighter(
        JSON.stringify(code, undefined, 2),
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
      )}
    </React.Fragment>
  );
}

CodeEditor.propTypes = {
  code: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  dirty: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

function createCodeEditor() {
  return CodeEditor;
}

module.exports = createCodeEditor;

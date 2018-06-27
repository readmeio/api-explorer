const React = require('react');

const syntaxHighlighter = require('@readme/syntax-highlighter');

function Code(props) {
  const language = (props.className || '').replace('language-', '');
  return <code className={language ? `lang-${language}` : null} dangerouslySetInnerHTML={{ __html: syntaxHighlighter(props.children[0], language) }} />;
}

module.exports = (sanitizeSchema) => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className'];

  return Code;
};

const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('../lib/markdown');
const sanitizeSchema = require('hast-util-sanitize/lib/github.json');
const Variable = require('../Variable');
const variableParser = require('../lib/markdown/variable-parser.js');

sanitizeSchema.tagNames.push('readme-variable');
sanitizeSchema.attributes['readme-variable'] = ['variable'];

const remark = require('remark');
const reactRenderer = require('remark-react');

function renderMarkdown(text) {
  return remark()
    .use(variableParser)
    .use(reactRenderer, {
      sanitize: sanitizeSchema,
      remarkReactComponents: {
        'readme-variable': function ({ variable }) {
          return <Variable k={variable} value={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]} />
        },
      },
    })
    .processSync(text)
    .contents;
}

const Textarea = ({ block, flags }) => {
  return (
    <div className="magic-block-textarea">{renderMarkdown(block.text)}</div>
  );
};

Textarea.propTypes = {
  block: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
  flags: PropTypes.shape({}),
};

Textarea.defaultProps = {
  flags: {},
};
module.exports = Textarea;

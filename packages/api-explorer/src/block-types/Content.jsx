const React = require('react');
const PropTypes = require('prop-types');

const markdown = require('@readme/markdown').default;

const CallOut = require('./CallOut');
const Html = require('./Html');
const TextArea = require('./TextArea');
const Code = require('./Code');
const ImageBlock = require('./Image');
const Embed = require('./Embed');
const Parameters = require('./Parameters');
const ApiHeader = require('./ApiHeader');

const parseBlocks = require('../lib/parse-magic-blocks');

const Loop = ({ content, column, flags, splitReferenceDocs }) => {
  const elements = content.map((block, key) => {
    const props = { key, block, flags, splitReferenceDocs };
    switch (block.type) {
      case 'textarea':
        return <TextArea {...props} />;
      case 'html':
        return <Html {...props} />;
      case 'embed':
        return <Embed {...props} />;
      case 'api-header':
        return <ApiHeader {...props} />;
      case 'code':
        return <Code {...props} dark={column === 'right'} />;
      case 'callout':
        return <CallOut {...props} />;
      case 'parameters':
        return <Parameters {...props} />;
      case 'image':
        return <ImageBlock {...props} />;
      default:
        return null;
    }
  });

  return <div>{elements}</div>;
};

const Content = props => {
  const { body, isThreeColumn, useNewMarkdownEngine } = props;

  if (useNewMarkdownEngine) {
    const content = markdown(body);

    if (isThreeColumn === true) {
      return (
        <div className="hub-reference-section">
          <div className="hub-reference-left">
            <div className="markdown-body">{content}</div>
          </div>
          <div className="hub-reference-right">
            <div className="markdown-body">{content}</div>
          </div>
        </div>
      );
    }

    return <div className="markdown-body">{content}</div>;
  }

  const content = parseBlocks(body);

  const left = [];
  const right = [];
  content.forEach(elem => {
    if (elem.sidebar) {
      right.push(elem);
    } else {
      left.push(elem);
    }
  });

  if (isThreeColumn === true) {
    return (
      <div className="hub-reference-section">
        <div className="hub-reference-left">
          <div className="content-body">
            <Loop column="left" content={left} flags={props.flags} splitReferenceDocs={props.splitReferenceDocs} />
          </div>
        </div>
        <div className="hub-reference-right">
          <div className="content-body">
            <Loop column="right" content={right} flags={props.flags} splitReferenceDocs={props.splitReferenceDocs} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Loop
      column={isThreeColumn}
      content={isThreeColumn === 'left' ? left : right}
      flags={props.flags}
      splitReferenceDocs={props.splitReferenceDocs}
    />
  );
};

Loop.propTypes = {
  column: PropTypes.string,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  flags: PropTypes.shape({
    correctnewlines: PropTypes.bool,
  }),
  splitReferenceDocs: PropTypes.bool,
};

Loop.defaultProps = {
  column: 'left',
  flags: {},
  splitReferenceDocs: false,
};

Content.propTypes = {
  body: PropTypes.string,
  flags: PropTypes.shape({}),
  isThreeColumn: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  splitReferenceDocs: PropTypes.bool,
  useNewMarkdownEngine: PropTypes.bool,
};

Content.defaultProps = {
  body: '',
  flags: {},
  isThreeColumn: true,
  splitReferenceDocs: false,
  useNewMarkdownEngine: false,
};

module.exports = Content;

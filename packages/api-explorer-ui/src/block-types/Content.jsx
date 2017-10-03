const CallOut = require('./CallOut');
const Html = require('./Html');
const TextArea = require('./TextArea');
const BlockCode = require('./Code');
const ImageBlock = require('./Image');
const Embed = require('./Embed');
const Parameters = require('./Parameters');
const ApiHeader = require('./ApiHeader');

const React = require('react');
const PropTypes = require('prop-types');

const parseBlocks = require('../lib/parse-magic-blocks');

const Loop = ({ content, column, flags }) => {
  const elements = content.map((block, key) => {
    const props = { key, block, flags };
    switch (block.type) {
      case 'textarea':
        // eslint-disable-next-line react/no-array-index-key
        return <TextArea {...props} />;
      case 'html':
        // eslint-disable-next-line react/no-array-index-key
        return <Html {...props} />;
      case 'embed':
        // eslint-disable-next-line react/no-array-index-key
        return <Embed {...props} />;
      case 'api-header':
        // eslint-disable-next-line react/no-array-index-key
        return <ApiHeader {...props} />;
      case 'code':
        // eslint-disable-next-line react/no-array-index-key
        return <BlockCode {...props} dark={column === 'right'} />;
      case 'callout':
        // eslint-disable-next-line react/no-array-index-key
        return <CallOut {...props} />;
      case 'parameters':
        // eslint-disable-next-line react/no-array-index-key
        return <Parameters {...props} />;
      case 'image':
        // eslint-disable-next-line react/no-array-index-key
        return <ImageBlock {...props} />;
      default:
        return null;
    }
  });
  return <div>{elements}</div>;
};

const Content = props => {
  const { body } = props;
  const isThreeColumn = props['is-three-column'];
  const content = parseBlocks(body);

  if (isThreeColumn) {
    const left = [];
    const right = [];
    content.forEach(elem => {
      if (elem.sidebar) {
        right.push(elem);
      } else {
        left.push(elem);
      }
    });
    return (
      <div className="hub-reference-section">
        <div className="hub-reference-left">
          <div className="content-body">
            <Loop content={left} column="left" flags={props.flags} />
          </div>
        </div>
        <div className="hub-reference-right">
          <div className="content-body">
            <Loop content={right} column="right" />
          </div>
        </div>
      </div>
    );
  }
  return <Loop content={content} flags={props.flags} />;
};

Loop.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  column: PropTypes.string,
  flags: PropTypes.shape({}),
};

Loop.defaultProps = {
  column: 'left',
  flags: {},
};

Content.propTypes = {
  'is-three-column': PropTypes.bool,
  body: PropTypes.string,
  flags: PropTypes.shape({}),
};

Content.defaultProps = {
  'is-three-column': true,
  body: '',
  flags: {},
};

module.exports = Content;

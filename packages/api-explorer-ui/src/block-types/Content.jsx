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

const Loop = ({ content, column }) => {
  const elements = content.map((block, i) => {
    switch (block.type) {
      case 'textarea':
        // eslint-disable-next-line react/no-array-index-key
        return <TextArea key={i} block={block} />;
      case 'html' :
        // eslint-disable-next-line react/no-array-index-key
        return <Html key={i} block={block} />;
      case 'embed':
        // eslint-disable-next-line react/no-array-index-key
        return <Embed key={i} block={block} />;
      case 'api-header':
        // eslint-disable-next-line react/no-array-index-key
        return <ApiHeader key={i} block={block} />;
      case 'code':
        // eslint-disable-next-line react/no-array-index-key
        return <BlockCode key={i} block={block} dark={column === 'right'} />;
      case 'callout':
        // eslint-disable-next-line react/no-array-index-key
        return <CallOut key={i} block={block} />;
      case 'parameters':
        // eslint-disable-next-line react/no-array-index-key
        return <Parameters key={i} block={block} />;
      case 'image':
        // eslint-disable-next-line react/no-array-index-key
        return <ImageBlock key={i} block={block} />;
      default:
        return null;
    }
  });
  return (
    <div>
      { elements }
    </div>
  );
};

const Content = (props) => {
  const { body } = props;
  const isThreeColumn = props['is-three-column'];

  const content = parseBlocks(body);

  if (isThreeColumn) {
    const left = [];
    const right = [];
    content.forEach((elem) => {
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
            <Loop content={left} column="left" />
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

  return <Loop content={content} />;
};


Loop.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
  })).isRequired,
  column: PropTypes.string,
};

Loop.defaultProps = {
  column: 'left',
};

Content.propTypes = {
  'is-three-column': PropTypes.bool,
  body: PropTypes.string,
};

Content.defaultProps = {
  'is-three-column': true,
  body: '',
};

module.exports = Content;

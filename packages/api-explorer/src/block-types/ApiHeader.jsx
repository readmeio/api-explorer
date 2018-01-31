const slug = require('lodash.kebabcase');
const React = require('react');
const PropTypes = require('prop-types');

const ApiHeader = ({ block }) => {
  return (
    <div className="magic-block-api-header">
      <h1 className="header-scroll is-api-header">
        <span id={slug(block.data.title)} />
        <div className="anchor waypoint" id={`section-${slug(block.data.title)}`} />
        {block.data.type &&
        block.data.type !== 'basic' && (
          <span className={`pg-type-big pg-type type-${slug(block.data.type)}`} />
        )}
        {block.data.title}
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a className="fa fa-anchor" href={`#section-${slug(block.data.title)}`} />
        }
      </h1>
    </div>
  );
};

ApiHeader.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

module.exports = ApiHeader;

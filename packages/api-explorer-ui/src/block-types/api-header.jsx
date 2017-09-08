import uslug from 'uslug';

const React = require('react');
const PropTypes = require('prop-types');

const ApiHeader = ({ block }) => {
  return (
    <div className="magic-block-api-header">
      <h1 className="header-scroll is-api-header">
        <span id={uslug(block.data.title)} />
        <div className="anchor waypoint" id={`section-${uslug(block.data.title)}`} />
        {
          (block.data.type && block.data.type !== 'basic') && (
            <span className={`pg-type-big pg-type type-${uslug(block.data.type)}`} />
          )
        }
        {block.data.title}
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a className="fa fa-anchor" href={`#section-${uslug(block.data.title)}`} />
        }
      </h1>
    </div>
  );
};

ApiHeader.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

module.exports = ApiHeader;

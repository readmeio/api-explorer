require('./style.scss');

const React = require('react');
const PropTypes = require('prop-types');

function generateHeadingId(e) {
  if (typeof e === 'object') {
    return generateHeadingId(e.props.children[0]);
  }
  return e.toLowerCase().replace(/[^\w]+/g, '-');
}

function Heading(props) {
  const id = `section-${generateHeadingId(props.children[0])}`;
  return React.createElement(props.tag, { className: 'heading header-scroll' }, [
    <div key={`anchor-${id}`} className="anchor waypoint" id={id} />,
    <div key={`heading-text-${id}`}>{props.children}</div>,
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a key={`anchor-icon-${id}`} className="fa fa-anchor" href={`#${id}`} />,
  ]);
}

function CreateHeading(level = 2) {
  // eslint-disable-next-line react/display-name
  return props => <Heading tag={`h${level}`} {...props} />;
}

Heading.propTypes = {
  children: PropTypes.array.isRequired,
  tag: PropTypes.string.isRequired,
};

module.exports = level => CreateHeading(level);

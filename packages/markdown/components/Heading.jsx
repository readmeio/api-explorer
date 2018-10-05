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
  return React.createElement(props.level, { className: 'header-scroll' }, [
    <div className="anchor waypoint" id={id} key={`anchor-${id}`} />,
    ...props.children,
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a className="fa fa-anchor" href={`#${id}`} key={`anchor-icon-${id}`} />,
  ]);
}

function createHeading(level) {
  return props => <Heading level={level} {...props} />;
}

Heading.propTypes = {
  level: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
};

module.exports = level => createHeading(level);

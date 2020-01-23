const React = require('react');
const PropTypes = require('prop-types');

function generateHeadingId(e) {
  if (typeof e === 'object') {
    return generateHeadingId(e.props.children[0]);
  }
  return e.toLowerCase().replace(/[^\w]+/g, '-');
}

function Heading(props) {
  // console.log('Heading', props);
  const id = `section-${generateHeadingId(props.children[0])}`;
  return React.createElement(props.level, { className: 'header-scroll' }, [
    <div key={`anchor-${id}`} className="anchor waypoint" id={id} />,
    ...props.children,
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a key={`anchor-icon-${id}`} className="fa fa-anchor" href={`#${id}`} />,
  ]);
}

function createHeading(level) {
  // eslint-disable-next-line react/display-name
  return props => <Heading level={level} {...props} />;
}

Heading.propTypes = {
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
  level: PropTypes.string.isRequired,
};

module.exports = level => createHeading(level);

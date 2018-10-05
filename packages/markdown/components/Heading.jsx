const React = require('react');
const PropTypes = require('prop-types');

function Heading(props) {
  // const id = `section-${props.children[0].toLowerCase().replace(/[^\w]+/g, '-')}`;
  const id = `section-${generateId(props.children[0])}`;
  return React.createElement(props.level, { className: 'header-scroll' }, [
    <div className="anchor waypoint" id={id} key={`anchor-${id}`} />,
    ...props.children,
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a className="fa fa-anchor" href={`#${id}`} key={`anchor-icon-${id}`} />,
  ]);
}

function generateId(element) {
  if(typeof element == "object") {
    const type = (element.type.name || element.type).toLowerCase();
    return type + `-${generateId(element.props.children[0])}`;
  }
  else {
    return element.toLowerCase().replace(/[^\w]+/g, '-');
  } 
}

function createHeading(level) {
  return props => <Heading level={level} {...props} />;
}

Heading.propTypes = {
  level: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
};

module.exports = level => createHeading(level);

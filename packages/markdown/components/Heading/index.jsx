const React = require('react');
const PropTypes = require('prop-types');

function generateHeadingIdDeprecated(e) {
  if (typeof e === 'object') {
    return generateHeadingIdDeprecated(e.props.children[0]);
  }
  return e.toLowerCase().replace(/[^\w]+/g, '-');
}

function Heading({ tag, ...props }) {
  if (!props.children) return '';

  const attrs = {
    className: `heading heading-${props.level} header-scroll`,
    align: props.align,
  };
  return React.createElement(tag, attrs, [
    <div key={`heading-anchor-${props.id}-deprecated`} id={`section-${generateHeadingIdDeprecated(props.id)}`} />,
    <div key={`heading-anchor-${props.id}`} className="heading-anchor anchor waypoint" id={props.id} />,
    <div key={`heading-text-${props.id}`} className="heading-text">
      {props.children}
    </div>,
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a key={`heading-anchor-icon-${props.id}`} className="heading-anchor-icon fa fa-anchor" href={`#${props.id}`} />,
  ]);
}

function CreateHeading(level, anchors) {
  // eslint-disable-next-line react/display-name
  return props => <Heading {...props} anchors={anchors} level={level} tag={`h${level}`} />;
}

Heading.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right', '']),
  anchors: PropTypes.object,
  children: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  level: PropTypes.number,
  tag: PropTypes.string.isRequired,
};
Heading.defaultProps = {
  align: '',
  id: '',
  level: 2,
};

module.exports = (level, anchors) => CreateHeading(level, anchors);

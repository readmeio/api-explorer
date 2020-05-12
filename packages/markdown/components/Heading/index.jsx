const React = require('react');
const PropTypes = require('prop-types');

function Heading({ tag, opts, ...props }) {
  if (!props.children) return '';

  const { splitReferenceDocs } = opts;
  const attrs = {
    className: `heading heading-${props.level} header-scroll`,
    align: props.align,
  };

  const children = [
    <div key={`heading-anchor-${props.id}`} className="heading-anchor anchor waypoint" id={props.id} />,
    <div key={`heading-text-${props.id}`} className="heading-text">
      {props.children}
    </div>,
  ];

  if (splitReferenceDocs === 'undefined' || splitReferenceDocs) {
    children.push(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a key={`heading-anchor-icon-${props.id}`} className="heading-anchor-icon fa fa-anchor" href={`#${props.id}`} />
    );
  }

  return React.createElement(tag, attrs, children);
}

function CreateHeading(level, anchors, opts) {
  // eslint-disable-next-line react/display-name
  return props => <Heading {...props} anchors={anchors} level={level} opts={opts} tag={`h${level}`} />;
}

Heading.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right', '']),
  anchors: PropTypes.object,
  children: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  level: PropTypes.number,
  opts: PropTypes.object,
  tag: PropTypes.string.isRequired,
};
Heading.defaultProps = {
  align: '',
  id: '',
  level: 2,
};

module.exports = (level, anchors, opts) => CreateHeading(level, anchors, opts);

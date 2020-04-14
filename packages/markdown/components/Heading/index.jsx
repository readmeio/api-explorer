/* eslint-disable consistent-return */
const React = require('react');
const PropTypes = require('prop-types');

function generateHeadingId(e, anchors) {
  /* istanbul ignore next */
  if (typeof window === 'undefined') return;
  // if (typeof e === 'object') {
  //   const text = e?.props?.children?.[0] || JSON.stringify(e).slice(0, 75).replace(/\s/g, '');
  //   return generateHeadingId(text);
  // }

  let id = JSON.stringify(e)
    .toLowerCase()
    .trim()
    .replace(/[^\d\w]+/g, '-');

  if (anchors) {
    if (e in anchors) {
      id += `-${anchors[e]}`;
      anchors[e] += 1;
    } else anchors[e] = 1;
  }

  return id;
}

function Heading({ tag, opts, ...props }) {
  if (!props.children) return '';
  const { splitReferenceDocs } = opts;

  const id = `section-${generateHeadingId(props.children[0], props.anchors)}`;
  const attrs = {
    className: `heading heading-${props.level} header-scroll`,
    align: props.align,
  };
  const children = [
    <div key={`heading-anchor-${id}`} className="heading-anchor anchor waypoint" id={id} />,
    <div key={`heading-text-${id}`} className="heading-text">
      {props.children}
    </div>,
  ];

  if (splitReferenceDocs) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    children.push(<a key={`heading-anchor-icon-${id}`} className="heading-anchor-icon fa fa-anchor" href={`#${id}`} />);
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
  level: PropTypes.number,
  opts: PropTypes.object,
  tag: PropTypes.string.isRequired,
};
Heading.defaultProps = {
  align: '',
  level: 2,
  opts: {
    splitReferenceDocs: false,
  },
};

module.exports = (level, anchors, opts) => CreateHeading(level, anchors, opts);

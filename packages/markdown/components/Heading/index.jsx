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

function Heading({ tag, ...props }) {
  if (!props.children) return '';
  console.log(props);
  const id = `section-${generateHeadingId(props.children[0], props.anchors)}`;
  const attrs = {
    className: `heading heading-${props.level} header-scroll`,
    align: props.align,
  };
  return React.createElement(tag, attrs, [
    <div key={`heading-anchor-${id}`} className="heading-anchor anchor waypoint" id={id} />,
    <div key={`heading-text-${id}`} className="heading-text">
      {props.children}
    </div>,
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a key={`heading-anchor-icon-${id}`} className="heading-anchor-icon fa fa-anchor" href={`#${id}`} />,
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
  level: PropTypes.number,
  tag: PropTypes.string.isRequired,
};
Heading.defaultProps = {
  align: '',
  level: 2,
};

module.exports = (level, anchors) => CreateHeading(level, anchors);

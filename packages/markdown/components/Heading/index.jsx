require('./style.scss');

const React = require('react');
const PropTypes = require('prop-types');

let count = {};

document.addEventListener('DOMContentLoaded', () => {
  if ('$' in window)
    $(document).on('pjax:start', () => {
      count = {};
    });
});

function generateHeadingId(e) {
  if (typeof e === 'object') return generateHeadingId(e.props.children[0]);

  let id = e.toLowerCase().replace(/[^\w]+/g, '-');

  if (e in count) {
    id += `-${count[e]}`;
    count[e] += 1;
  } else count[e] = 1;

  return id;
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

const React = require('react');

function Heading(level) {
  return function (props) {
    const id = `section-${props.children[0].toLowerCase().replace(/[^\w]+/g, '-')}`
    return (
      React.createElement(level, Object.assign({ className: 'header-scroll' }, props), [
        <div className="anchor waypoint" id={id} key={`anchor-${id}`} />,
        ...props.children,
        <a className="fa fa-anchor" href={`#${id}`} key={`anchor-icon-${id}`} />,
      ])
    )
  }
}

module.exports = (level) => {
  return Heading(level);
};

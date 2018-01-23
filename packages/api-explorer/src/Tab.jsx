const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

function Tab({ children, onClick, selected }) {
  return (
    // eslint-disable-next-line jsx-a11y/href-no-hash
    <a
      href="#"
      className={classNames('hub-reference-results-header-item tabber-tab', {
        selected,
      })}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

module.exports = Tab;

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

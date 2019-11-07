const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

function Tab({ children, onClick, selected }) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      className={classNames('hub-reference-results-header-item tabber-tab invalidclass', {
        selected,
      })}
      href="#"
      onClick={onClick}
    >
      {children}
    </a>
  );
}

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

module.exports = Tab;

const React = require('react');
const PropTypes = require('prop-types');

function Table({ children }) {
  return (
    <div className="marked-table">
      <table>{children}</table>
    </div>
  );
}

Table.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

module.exports = () => Table;

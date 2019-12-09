const React = require('react');
const PropTypes = require('prop-types');

function Table(props) {
  console.log('Table', props);
  const { children } = props;
  return <table>{children}</table>;
}

Table.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

module.exports = () => Table;

const React = require('react');

function Table({ children }) {
  return React.createElement('div', { className: 'marked-table' }, React.createElement('table', null, children));
}

module.exports = () => {
  return Table;
};

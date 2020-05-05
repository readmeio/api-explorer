const toString = require('hast-util-to-string');

module.exports = () => {
  return function compile(node) {
    return toString(node);
  };
};

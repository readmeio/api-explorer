const getPath = require('./get-path');

module.exports = function getPathOperation(swagger, doc) {
  if (swagger.paths && doc.swagger && getPath(swagger, doc)) {
    return getPath(swagger, doc)[doc.api.method];
  }

  return { parameters: [] };
};

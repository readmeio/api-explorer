module.exports = function getPath(swagger, doc) {
  return doc.swagger ? swagger.paths[doc.swagger.path] : { parameters: [] };
};

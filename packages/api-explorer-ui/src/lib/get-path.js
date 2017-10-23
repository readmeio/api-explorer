module.exports = function getPath(swagger, doc) {
  // console.log(swagger);
  return doc.swagger ? swagger.paths[doc.swagger.path] : { parameters: [] };
};

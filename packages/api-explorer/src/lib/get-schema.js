// Gets the schema of the first media type defined in the `content` of the path operation
// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#user-content-parameterContent
module.exports = pathOperation => {
  try {
    if (pathOperation.requestBody.content) {
      const type = Object.keys(pathOperation.requestBody.content)[0];
      return { type, schema: pathOperation.requestBody.content[type].schema };
    }
  } catch (e) {} // eslint-disable-line no-empty

  return undefined;
};

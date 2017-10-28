module.exports = pathOperation => {
  let schema;

  try {
    if (pathOperation.requestBody.content) {
      const firstType = Object.keys(pathOperation.requestBody.content)[0]
      schema = pathOperation.requestBody.content[firstType].schema;
    } else {
      schema = pathOperation.requestBody;
    }
  } catch (e) {} // eslint-disable-line no-empty

  return schema;
};

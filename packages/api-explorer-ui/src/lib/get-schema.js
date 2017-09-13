module.exports = pathOperation => {
  let schema;

  try {
    if (pathOperation.requestBody.content) {
      schema = pathOperation.requestBody.content['application/json'].schema;
    } else {
      schema = pathOperation.requestBody;
    }
  } catch (e) {} // eslint-disable-line no-empty

  return schema;
};

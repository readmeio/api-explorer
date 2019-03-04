function contentTypeIsJson(contentType) {
  const jsonContentTypes = ['application/json', 'application/vnd.api+json'];
  return jsonContentTypes.some(ct => contentType.includes(ct));
}

module.exports = contentTypeIsJson;

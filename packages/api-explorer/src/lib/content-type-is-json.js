function contentTypeIsJson(contentType) {
  const jsonContentTypes = ['application/json', '+json'];
  return jsonContentTypes.some(ct => contentType.includes(ct));
}

module.exports = contentTypeIsJson;

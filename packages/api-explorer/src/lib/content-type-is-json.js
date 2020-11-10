function contentTypeIsJson(contentType) {
  const jsonContentTypes = ['application/json', 'application/x-json', 'text/json', 'text/x-json', '+json', '*/*'];
  return jsonContentTypes.some(ct => contentType.includes(ct));
}

module.exports = contentTypeIsJson;

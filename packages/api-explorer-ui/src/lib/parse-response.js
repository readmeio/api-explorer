const statusCodes = require('./statuscodes');

function parseResponse(res, responseBody, har) {
  const contentDisposition = res.headers.get('Content-Disposition');

  return {
    method: har.log.entries[0].request.method,
    requestHeaders: har.log.entries[0].request.headers.map(
      header => `${header.name}: ${header.value}`,
    ),
    responseHeaders: Array.from(res.headers.entries()).map(header => header.join(': ')),
    isBinary: !!(contentDisposition && contentDisposition.match(/attachment/)),
    url: har.log.entries[0].request.url,
    statusCode: statusCodes(res.status || 404),
    responseBody,
  };
}

module.exports = parseResponse;

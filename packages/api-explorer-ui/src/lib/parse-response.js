async function parseResponse(har, response) {
  const contentDisposition = response.headers.get('Content-Disposition');
  const contentType = response.headers.get('Content-Type');
  const isJson = contentType && contentType.includes('application/json');

  return {
    method: har.log.entries[0].request.method,
    requestHeaders: har.log.entries[0].request.headers.map(
      header => `${header.name}: ${header.value}`,
    ),
    responseHeaders: Array.from(response.headers.entries())
      .map(header => header.join(': '))
      .filter(header => !header.match(/x-final-url/i)),
    isBinary: !!(contentDisposition && contentDisposition.match(/attachment/)),
    url: har.log.entries[0].request.url,
    status: response.status,
    responseBody: await response[isJson ? 'json' : 'text'](),
  };
}

module.exports = parseResponse;

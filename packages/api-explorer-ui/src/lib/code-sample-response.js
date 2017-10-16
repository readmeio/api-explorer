const statusCodes = require('./statuscodes');

function result(res, responseBody, req) {
  // Is there a Content-Disposition header with a value of attachment
  const contentDisposition = res.headers.get('Content-Disposition');
  const isBinary = !!(contentDisposition && contentDisposition.match(/attachment/));

  const headersFormatted = [];

  req.log.entries[0].request.headers.forEach(ele => {
    headersFormatted.push(`${ele.name}: ${ele.value}`);
  });

  const responseHeaders = [];
  for (const header of res.headers.entries()) {
    responseHeaders.push(header.join(': '));
  }

  const results = {
    init: true,
    method: req.log.entries[0].request.method,
    requestHeaders: headersFormatted.join('\n'),
    responseHeaders,
    isBinary,
    url: req.log.entries[0].request.url,
    statusCode: statusCodes(res.status || 404),
    responseBody,
  };

  return results;
}

module.exports = result;

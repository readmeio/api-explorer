const { constructRequest } = require('fetch-har');
const { statusCodes } = require('./statuscodes');

const req = constructRequest;

function result(res) {
  const data = res.responseJSON ? JSON.stringify(res.responseJSON, undefined, 2) : res.responseText;

  const isBinary = !!res.getAllResponseHeaders().match(/Content-Disposition: attachment;/);

  const headersFormatted = [];

  req.headers.forEach((ele, i) => {
    headersFormatted.push(`${i} : ${ele}`);
  });

  let responseHeaders = res.getAllResponseHeaders();
  responseHeaders = responseHeaders
    .filter(responseHeaders.split('\n'), v => !v.match(/x-final-url:/i))
    .join('\n');

  const results = {
    init: true,
    method: req.method,
    requestHeaders: headersFormatted.join('\n'),
    responseHeaders,
    isBinary,
    url: req.url,
    data: res.responseText,
    statusCode: statusCodes(res.status || 404),
    dataString: data,
  };

  this.setState({ responseTabClass: 'hub-reference-right hub-reference-results tabber-parent on' });

  setTab('[data-tab=result]');
}

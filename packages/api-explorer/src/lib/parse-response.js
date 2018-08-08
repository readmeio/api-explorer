const { stringify } = require('querystring');

function getQuerystring(har) {
  // Converting [{ name: a, value: '123456' }] => { a: '123456' } so we can use querystring.stringify
  const convertedQueryString = (har.log.entries[0].request.queryString || [])
    .map(qs => ({ [qs.name]: qs.value }))
    .reduce((a, b) => Object.assign(a, b), {});

  return Object.keys(convertedQueryString).length > 0 ? `?${stringify(convertedQueryString)}` : '';
}

async function getResponseBody(response) {
  const contentType = response.headers.get('Content-Type');
  const isJson = contentType && contentType.includes('application/json');

  // We have to clone it before reading, just incase
  // we cannot parse it as JSON later, then we can
  // re-read again as plain text
  const clonedResponse = response.clone();
  let responseBody;

  try {
    responseBody = await response[isJson ? 'json' : 'text']();
  } catch (e) {
    responseBody = await clonedResponse.text();
  }

  return responseBody;
}

async function parseResponse(har, response) {
  const contentDisposition = response.headers.get('Content-Disposition');
  const querystring = getQuerystring(har);

  return {
    method: har.log.entries[0].request.method,
    requestHeaders: har.log.entries[0].request.headers.map(
      header => `${header.name}: ${header.value}`,
    ),
    responseHeaders: Array.from(response.headers.entries())
      .map(header => header.join(': '))
      .filter(header => !header.match(/x-final-url/i)),
    isBinary: !!(contentDisposition && contentDisposition.match(/attachment/)),
    url: har.log.entries[0].request.url.replace('https://try.readme.io/', '') + querystring,
    status: response.status,
    responseBody: await getResponseBody(response),
  };
}

module.exports = parseResponse;

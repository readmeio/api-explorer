const { stringify } = require('querystring');
const contentTypeIsJson = require('./content-type-is-json');

function getQuerystring(har) {
  // Converting [{ name: a, value: '123456' }] => { a: '123456' } so we can use querystring.stringify
  const convertedQueryString = (har.log.entries[0].request.queryString || [])
    .map(qs => ({ [qs.name]: qs.value }))
    .reduce((a, b) => Object.assign(a, b), {});

  return Object.keys(convertedQueryString).length > 0 ? `?${stringify(convertedQueryString)}` : '';
}

async function getResponseBody(response) {
  const contentType = response.headers.get('Content-Type');
  const isJson = contentType && contentTypeIsJson(contentType);

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

function getRequestBody(har) {
  let requestBody;

  try {
    requestBody = har.log.entries[0].request.postData.text || null;
  } catch (e) {
    requestBody = null;
  }

  return requestBody;
}

async function parseResponse(har, response) {
  const contentDisposition = response.headers.get('Content-Disposition');
  const querystring = getQuerystring(har);
  const responseHeaders = Array.from(response.headers.entries());
  const type = responseHeaders.find(([header]) => header === 'content-type');
  return {
    method: har.log.entries[0].request.method,
    requestHeaders: har.log.entries[0].request.headers.map(
      header => `${header.name}: ${header.value}`,
    ),
    requestBody: getRequestBody(har),
    responseHeaders: responseHeaders
      .filter(header => !header[0].match(/x-final-url/i))
      .map(header => ({name: header[0], value: header[1]})),
    type: type ? type[1] : null,
    isBinary: !!(contentDisposition && contentDisposition.match(/attachment/)),
    url: har.log.entries[0].request.url.replace('https://try.readme.io/', '') + querystring,
    status: response.status,
    responseBody: await getResponseBody(response),
  };
}

module.exports = parseResponse;

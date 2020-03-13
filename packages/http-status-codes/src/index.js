/* eslint-disable no-use-before-define */
// https://github.com/nodejs/node/blob/master/lib/_http_server.js

const codes = {
  '1XX': ['Informational', true],
  100: ['Continue', true],
  101: ['Switching Protocols', true],
  102: ['Processing', true],
  103: ['Early Hints', true],

  '2XX': ['Success', true],
  200: ['OK', true],
  201: ['Created', true],
  202: ['Accepted', true],
  203: ['Non-Authoritative Information', true],
  204: ['No Content', true],
  205: ['Reset Content', true],
  206: ['Partial Content', true],

  '3XX': ['Redirection', true],
  300: ['Multiple Choices', true],
  301: ['Moved Permanently', true],
  302: ['Found', true],
  303: ['See Other', true],
  304: ['Not Modified', true],
  305: ['Use Proxy', true],
  306: ['Unused', true],
  307: ['Temporary Redirect', true],
  308: ['Permanent Redirect', true],

  '4XX': ['Client Error', false],
  400: ['Bad Request', false],
  401: ['Unauthorized', false],
  402: ['Payment Required', false],
  403: ['Forbidden', false],
  404: ['Not Found', false],
  405: ['Method Not Allowed', false],
  406: ['Not Acceptable', false],
  407: ['Proxy Authentication Required', false],
  408: ['Request Timeout', false],
  409: ['Conflict', false],
  410: ['Gone', false],
  411: ['Length Required', false],
  412: ['Precondition Failed', false],
  413: ['Request Entry Too Large', false],
  414: ['Request-URI Too Long', false],
  415: ['Unsupported Media Type', false],
  416: ['Requested Range Not Satisfiable', false],
  417: ['Expectation Failed', false],
  418: ["I'm a teapot", false],
  420: ['Enhance Your Calm', false],
  422: ['Unprocessable Entity', false],
  423: ['Locked', false],
  426: ['Upgrade Required', false],
  428: ['Precondition Required', false],
  429: ['Too Many Requests', false],
  431: ['Request Header Fields Too Large', false],
  451: ['Unavailable For Legal Reasons', false],

  '5XX': ['Server Error', false],
  500: ['Internal Server Error', false],
  501: ['Not Implemented', false],
  502: ['Bad Gateway', false],
  503: ['Service Unavailable', false],
  504: ['Gateway Timeout', false],
  505: ['HTTP Version Not Supported', false],
  511: ['Network Authentication Required', false],
};

function getStatusCode(code) {
  if (!isValidStatusCode(code)) {
    throw new Error(`${code} is not a known HTTP status code.`);
  }

  return {
    code,
    message: codes[code][0],
    success: codes[code][1],
  };
}

function isSuccess(code) {
  return getStatusCode(code).success;
}

function isValidStatusCode(code) {
  return code in codes;
}

module.exports = {
  codes,
  getStatusCode,
  isSuccess,
  isValidStatusCode,
};

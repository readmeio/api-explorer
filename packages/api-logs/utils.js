export function getHeaderValue(requestHeaders, headerName) {
  const header = requestHeaders.find(e => e.name.toLowerCase() === headerName.toLowerCase());
  return header ? header.value : null;
}

export function checkFreshness(existingLogs, incomingLogs) {
  if (
    (!existingLogs.length && incomingLogs.length) ||
    (existingLogs.length && incomingLogs.length && existingLogs[0]._id !== incomingLogs[0]._id)
  ) {
    return incomingLogs;
  }
  throw new Error('Requested logs are not up-to-date.');
}

export function handleResponse(res) {
  if (res.status === 200) {
    return res.json();
  }
  throw new Error('Failed to fetch logs');
}

/**
 * Accepts a user agent string and transforms it into something that is more readable
 */
export function getFormattedUserAgent(userAgent) {
  const userAgentString = typeof userAgent === 'string' && userAgent.length ? userAgent.trim() : '';
  // Take everything before the first slash, omitting the version and extraneous information
  const name = userAgentString.split('/')[0];

  if (name === 'ReadMe-API-Explorer') {
    return name.split('-').join(' ');
  }

  // Takes the string up to where a dash, underscore, or space is detected
  const prettyUA = name.split(/[\s-_]+/)[0].toLowerCase();

  switch (prettyUA) {
    case 'node':
    case 'python':
    case 'ruby':
    case 'php':
      return prettyUA;
    default:
      return userAgentString;
  }
}

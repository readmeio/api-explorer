module.exports = function configureSecurity(oas, query, headers, scope, sec) {
  let key;
  try {
    key = Object.keys(sec)[0];
  } catch (e) {
    return;
  }

  if (!oas.securitySchemes[key]) return;
  const security = oas.securitySchemes[key];

  if (security.type === 'basic') {
    headers.Authorization = `Basic ${new Buffer(`${scope.apiAuth.auth._basic_username}:${scope.apiAuth.auth._basic_password}`).toString('base64')}`;
  }

  if (security.type === 'apiKey') {
    if (security.in === 'query') {
      query[security.name] = scope.apiAuth.auth[security.name];
    }
    if (security.in === 'header') {
      headers[security.name] = scope.apiAuth.auth[security.name];

      if (security['x-bearer-format']) {
        // Uppercase: token -> Token
        const bearerFormat = security['x-bearer-format'].charAt(0).toUpperCase() + security['x-bearer-format'].slice(1);
        headers[security.name] = `${bearerFormat} ${headers[security.name]}`;
      }
    }
  }

  if (security.type === 'oauth2') {
    headers.Authorization = `Bearer ${scope.key.api_key}`;
  }
};

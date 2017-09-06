module.exports = function configureSecurity(oas, values, scheme) {
  const key = Object.keys(scheme)[0];
  if (!key) return {};

  if (!oas.securitySchemes[key]) return undefined;
  const security = oas.securitySchemes[key];

  if (security.type === 'basic') {
    return {
      type: 'header',
      name: 'Authorization',
      value: `Basic ${new Buffer(`${values.auth.user}:${values.auth.password}`).toString('base64')}`,
    };
  }

  if (security.type === 'apiKey') {
    if (security.in === 'query') {
      return {
        type: 'query',
        name: security.name,
        value: values.auth[security.name],
      };
    }
    if (security.in === 'header') {
      const header = {
        type: 'header',
        name: security.name,
        value: values.auth[security.name],
      };

      if (security['x-bearer-format']) {
        // Uppercase: token -> Token
        const bearerFormat = security['x-bearer-format'].charAt(0).toUpperCase() + security['x-bearer-format'].slice(1);
        header.name = security.name;
        header.value = `${bearerFormat} ${header.value}`;
      }
      return header;
    }
  }

  if (security.type === 'oauth2') {
    return {
      type: 'header',
      name: 'Authorization',
      value: `Bearer ${values.auth}`,
    };
  }

  return undefined;
};

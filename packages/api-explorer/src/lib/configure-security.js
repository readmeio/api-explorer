function harValue(type, value) {
  if (!value.value) return undefined;
  return { type, value };
}

module.exports = function configureSecurity(oas, values, scheme, securityDefinitions) {
  if (!scheme) return {};

  if (Object.keys(values || {}).length === 0) return undefined;
  if (!oas.components.securitySchemes[scheme]) return undefined;
  const security = securityDefinitions ? securityDefinitions[scheme] : oas.components.securitySchemes[scheme];
  if (security.type === 'http') {
    if (security.scheme === 'basic') {
      // Return with no header if user and password are blank
      if (!values[scheme].user && !values[scheme].pass) return false;

      return harValue('headers', {
        name: 'Authorization',
        value: `Basic ${new Buffer(`${values[scheme].user}:${values[scheme].pass}`).toString(
          'base64',
        )}`,
      });
    }

    if (security.scheme === 'bearer') {
      if (!values[scheme]) return false;

      return harValue('headers', {
        name: 'Authorization',
        value: `Bearer ${values[scheme]}`,
      });
    }
  }

  if (security.type === 'apiKey') {
    if (security.in === 'query') {
      return harValue('queryString', {
        name: security.name,
        value: values[scheme],
      });
    }
    if (security.in === 'header') {
      const header = {
        name: security.name,
        value: values[scheme],
      };

      if (security['x-bearer-format']) {
        // Uppercase: token -> Token
        const bearerFormat =
          security['x-bearer-format'].charAt(0).toUpperCase() +
          security['x-bearer-format'].slice(1);
        header.name = security.name;
        header.value = `${bearerFormat} ${header.value}`;
      }
      return harValue('headers', header);
    }
  }

  if (security.type === 'oauth2') {
    if (!values[scheme]) return false;

    return harValue('headers', {
      name: 'Authorization',
      value: `Bearer ${values[scheme]}`,
    });
  }

  return undefined;
};

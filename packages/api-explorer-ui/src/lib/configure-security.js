function harValue(type, value) {
  if (!value.value) return undefined;
  return { type, value };
}

module.exports = function configureSecurity(oas, values, scheme) {
  const key = Object.keys(scheme)[0];
  if (!key) return {};

  if (Object.keys(values.auth || {}).length === 0) return undefined;

  if (!oas.components.securitySchemes[key]) return undefined;
  const security = oas.components.securitySchemes[key];

  if (security.type === 'basic') {
    return harValue('headers', {
      name: 'Authorization',
      value: `Basic ${new Buffer(`${values.auth.user}:${values.auth.password}`).toString('base64')}`,
    });
  }

  if (security.type === 'apiKey') {
    if (security.in === 'query') {
      return harValue('queryString', {
        name: security.name,
        value: values.auth[key],
      });
    }
    if (security.in === 'header') {
      const header = {
        name: security.name,
        value: values.auth[key],
      };

      if (security['x-bearer-format']) {
        // Uppercase: token -> Token
        const bearerFormat = security['x-bearer-format'].charAt(0).toUpperCase() + security['x-bearer-format'].slice(1);
        header.name = security.name;
        header.value = `${bearerFormat} ${header.value}`;
      }
      return harValue('headers', header);
    }
  }

  if (security.type === 'oauth2') {
    return harValue('headers', {
      name: 'Authorization',
      value: `Bearer ${values.auth[key]}`,
    });
  }

  return undefined;
};

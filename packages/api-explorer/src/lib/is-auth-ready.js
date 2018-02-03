function isAuthReady(operation, authData) {
  const authInputData = authData === undefined ? {} : authData;
  const securitySettings = operation.getSecurity();

  if (securitySettings.length === 0) return true;
  return securitySettings.some(requirement => {
    return Object.keys(requirement).every(key => {
      if (!operation.oas.components.securitySchemes[key]) return false;
      const scheme = operation.oas.components.securitySchemes[key];
      const auth = authInputData[key];

      if (scheme.type === 'http' && scheme.scheme === 'basic') {
        return auth && auth.user;
      }

      if (scheme.type === 'apiKey') {
        return auth;
      }

      if (scheme.type === 'oauth2') {
        return auth;
      }

      return false;
    });
  });
}

module.exports = isAuthReady;

import omit from 'lodash.omit'

function isRequired(securitySettings) {
  let requiredSecurity = securitySettings[0]
  Object.keys(securitySettings[0]).forEach(elem => {
    securitySettings.forEach(secSchemes => {
      if (!Object.keys(secSchemes).includes(elem)) {
        requiredSecurity = omit(requiredSecurity, elem)
      }
    })
  })
  return requiredSecurity
}

function isAuthReady(operation, authData) {
  const authInputData = authData === undefined ? {} : authData;
  const securitySettings = operation.getSecurity();

  if (securitySettings.length === 0) return true;

  const requiredSecurity = isRequired(securitySettings)
  return Object.keys(requiredSecurity).every(key => {
    const scheme = operation.securityDefinitions ? operation.securityDefinitions[key] : operation.oas.components.securitySchemes[key];
    if (!scheme) return false;
    const auth = authInputData[key];

    if (scheme.type === 'http') {
      if (scheme.scheme === 'basic') return auth && auth.user;
      if (scheme.scheme === 'bearer') return auth;
    }

    if (scheme.type === 'apiKey') {
      return auth;
    }

    if (scheme.type === 'oauth2') {
      return auth;
    }

    return false;
  });
}

module.exports = isAuthReady;

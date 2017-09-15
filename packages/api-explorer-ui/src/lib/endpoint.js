function authRequired(operation, authData = {}) {
  let ready = true;
  const securitySettings = operation.getSecurity();
  if (!securitySettings) return ready;
  // console.log(securitySettings);
  securitySettings.forEach(sec => {
    const key = Object.keys(sec)[0];

    if (!operation.oas.components.securitySchemes[key]) return;
    const security = operation.oas.components.securitySchemes[key];
    const auth = authData[key];
    console.log(auth);

    if (security.type === 'basic') {
      if (!auth || !auth.user) {
        ready = false;
      }
    }

    if (security.type === 'apiKey') {
      if (!auth) {
        ready = false;
      }
    }

    if (security.type === 'oauth2') {
      if (!auth) {
        ready = false;
      }
    }
  });
  // console.log(ready);
  return ready;
}

module.exports = authRequired;

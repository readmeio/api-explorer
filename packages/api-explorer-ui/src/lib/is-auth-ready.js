function isAuthReady(operation, authData) {
  let ready = true;

  const authInputData = authData === undefined ? {} : authData;
  const securitySettings = operation.getSecurity();
  if (!securitySettings) return ready;
  securitySettings.forEach(sec => {
    const keys = Object.keys(sec);
    // const key = Object.keys(sec)[0];

    const securities = [];
    keys.map(key => {
      if (!operation.oas.components.securitySchemes[key]) {
        return;
      }
      securities.push([operation.oas.components.securitySchemes[key], authInputData[key]]);
    });

    securities.map(schemes => {
      // console.log({ security });
      const security = schemes[0];
      const auth = schemes[1];
      // console.log({ auth });
      if (security.type === 'http' && security.scheme === 'basic') {
        if (!auth || !auth.username) {
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
  });
  return ready;
}

module.exports = isAuthReady;

function isAuthReady(operation, authData) {
  let ready = true;

  const authInputData = authData === undefined ? {} : authData;
  const securitySettings = operation.getSecurity();
  const obj = {
    security: [],
    securities: [],
  };
  const securities = [];
  const multipleSecurities = [];
  if (!securitySettings) return ready;

  // handle or cases
  if (securitySettings.length > 1) {
    const multipleObjectKeys = [];
    securitySettings.forEach(securitySetting => {
      multipleObjectKeys.push(Object.keys(securitySetting));
    });
    multipleObjectKeys.forEach(arr => {
      // groups and cases together
      if (arr.length > 1) {
        arr.forEach(key => {
          if (!operation.oas.components.securitySchemes[key]) {
            return;
          }
          multipleSecurities.push([
            operation.oas.components.securitySchemes[key],
            authInputData[key],
          ]);
        });
        securities.push(multipleSecurities);
      } else {
        arr.forEach(key => {
          if (!operation.oas.components.securitySchemes[key]) {
            return;
          }
          securities.push([operation.oas.components.securitySchemes[key], authInputData[key]]);
        });
      }
    });

    securities.forEach(schemes => {
      // handle and cases within an or case
      if (Array.isArray(schemes[0]) && Array.isArray(schemes[1])) {
        schemes.forEach(security => {
          const securityObj = security[0];
          const authVal = security[1];

          if (securityObj.type === 'http' && securityObj.scheme === 'basic') {
            if (!authVal || !authVal.user) {
              obj.securities.push(false);
            }
          }

          if (securityObj.type === 'apiKey') {
            if (!authVal) {
              obj.securities.push(false);
            }
          }

          if (securityObj.type === 'oauth2') {
            if (!authVal) {
              obj.securities.push(false);
            }
          }
        });
      } else {
        const security = schemes[0];
        const auth = schemes[1];

        if (security.type === 'http' && security.scheme === 'basic') {
          if (!auth || !auth.user) {
            obj.security.push(false);
          }
        }

        if (security.type === 'apiKey') {
          if (!auth) {
            obj.security.push(false);
          }
        }

        if (security.type === 'oauth2') {
          if (!auth) {
            obj.security.push(false);
          }
        }
      }
    });
    if (obj.securities.length === 0 && obj.security.length === 2) {
      ready = false;
    } else if (obj.securities.indexOf(false) !== -1 && obj.security.indexOf(false) !== -1) {
      ready = false;
    }
  } else {
    securitySettings.forEach(sec => {
      const keys = Object.keys(sec);

      keys.map(key => {
        if (!operation.oas.components.securitySchemes[key]) {
          return;
        }
        securities.push([operation.oas.components.securitySchemes[key], authInputData[key]]);
      });

      securities.map(schemes => {
        const security = schemes[0];
        const auth = schemes[1];

        if (security.type === 'http' && security.scheme === 'basic') {
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
    });
  }
  console.log(ready);
  return ready;
}

module.exports = isAuthReady;

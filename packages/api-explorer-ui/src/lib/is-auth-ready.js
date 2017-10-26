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
  // console.log(securitySettings);

  if (securitySettings.length > 1) {
    const multipleObjectKeys = [];
    securitySettings.forEach(securitySetting => {
      multipleObjectKeys.push(Object.keys(securitySetting));
    });
    // console.log(...multipleObjectKeys);
    // const flattened = [].concat(...multipleObjectKeys);
    // flattened.map(key => {
    //   if (!operation.oas.components.securitySchemes[key]) {
    //     return;
    //   }
    //   securities.push([operation.oas.components.securitySchemes[key], authInputData[key]]);
    // });
    multipleObjectKeys.forEach(arr => {
      // console.log(arr);
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
        console.log(multipleSecurities);
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
    console.log(securities);
    securities.forEach(schemes => {
      const security = schemes[0];
      const auth = schemes[1];
      // console.log({ auth });
      if (security.type === 'http' && security.scheme === 'basic') {
        if (!auth || !auth.username) {
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
    });
    // console.log(obj);
    if (obj.securities.length === 0 && obj.security.length === 2) {
      ready = false;
    } else if (obj.securities.indexOf(false) !== -1 && obj[index] === false) {
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
      // console.log(securities);
      //    if (securities.length > 1) {
      //     // at least one  securities need to be !auth to be false
      //     securities.map(schemes => {
      //       const security = schemes[0];
      //       const auth = schemes[1];
      //       if (security.type === 'http' && security.scheme === 'basic') {
      //         if (!auth || !auth.username) {
      //           // ready = false;
      //           obj.securities.push(false);
      //         }
      //         obj.securities.push(true);
      //       }
      //
      //       if (security.type === 'apiKey') {
      //         if (!auth) {
      //           // ready = false;
      //           obj.securities.push(false);
      //         }
      //         obj.securities.push(true);
      //       }
      //
      //       if (security.type === 'oauth2') {
      //         if (!auth) {
      //           // ready = false;
      //           obj.securities.push(false);
      //         }
      //         obj.securities.push(true);
      //       }
      //     });
      //   }
      //   // console.log(JSON.stringify(obj));
      //   const index = Object.keys(obj)[0];
      //   if (obj.securities.length === 0) {
      //     if (obj[index] === false) {
      //       ready = false;
      //     }
      //   } else if (obj.securities.indexOf(false) !== -1 && obj[index] === false) {
      //     ready = false;
      //   }
      // }
      securities.map(schemes => {
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
  }

  return ready;
}

module.exports = isAuthReady;

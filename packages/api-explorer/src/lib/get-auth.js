function getKey(user, scheme) {
  switch (scheme.type) {
    case 'oauth2':
    case 'apiKey':
      return user[scheme._key] || user.apiKey;
    case 'http':
      return user[scheme._key] || { user: user.user, pass: user.pass };
    default:
      return null;
  }
}

function getSingle(user, scheme = {}, selectedApp = false) {
  if (user.keys) {
    if (selectedApp) return getKey(user.keys.find(key => key.name === selectedApp), scheme);
    return getKey(user.keys[0], scheme);
  }

  return getKey(user, scheme);
}

function getAuth(user, operation) {
  return operation
    .getSecurity()
    .map(securityRequirement => {
      return Object.keys(securityRequirement)
        .map(name => {
          operation.oas.components.securitySchemes[name]._key = name;
          return { [name]: getSingle(user, operation.oas.components.securitySchemes[name]) };
        })
        .reduce((prev, next) => Object.assign(prev, next));
    })
    .reduce((prev, next) => Object.assign(prev, next), {});
}

module.exports = getAuth;

module.exports.getSingle = getSingle;

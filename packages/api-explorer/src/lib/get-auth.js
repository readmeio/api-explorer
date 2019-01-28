function getKey(user, scheme) {
  switch (scheme.type) {
    case 'oauth2':
    case 'apiKey':
      return user[scheme._key] || user.apiKey || '';
    case 'http':
      return user[scheme._key] || { user: user.user || '', pass: user.pass || '' };
    default:
      return '';
  }
}

function getSingle(user, scheme = {}, selectedApp = false) {
  if (user.keys) {
    if (selectedApp) return getKey(user.keys.find(key => key.name === selectedApp), scheme);
    return getKey(user.keys[0], scheme);
  }

  return getKey(user, scheme);
}

function getAuth(user, oasFiles) {
  return Object.keys(oasFiles)
    .map(id => {
      const oas = oasFiles[id];
      return Object.keys(oas.components.securitySchemes)
        .map(scheme => {
          return {
            [scheme]: getSingle(
              user,
              Object.assign({}, oas.components.securitySchemes[scheme], { _key: scheme }),
            ),
          };
        })
        .reduce((prev, next) => Object.assign(prev, next), {});
    })
    .reduce((prev, next) => Object.assign(prev, next), {});
}

module.exports = getAuth;

module.exports.getSingle = getSingle;

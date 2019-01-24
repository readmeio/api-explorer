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

function getAuth(user, scheme, selectedApp = false) {
  if (user.keys) {
    if (selectedApp) return getKey(user.keys.find(key => key.name === selectedApp), scheme);
    return getKey(user.keys[0], scheme);
  }

  return getKey(user, scheme);
}

module.exports = getAuth;

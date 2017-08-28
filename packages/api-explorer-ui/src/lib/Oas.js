const getPathOperation = require('./get-path-operation');

class Oas {
  constructor(oas) {
    Object.assign(this, oas);
  }

  hasAuth(path, method) {
    const security = this.getSecurity(path, method);
    return !!(security && security.length);
  }

  getPathOperation(doc) {
    return getPathOperation(this, doc);
  }

  getSecurity(path, method) {
    const operation = getPathOperation(this, { swagger: { path }, api: { method } });

    return operation.security || this.security;
  }

  prepareSecurity(path, method) {
    const securityRequirements = this.getSecurity(path, method);

    return securityRequirements.map((requirement) => {
      let security;
      let key;
      try {
        key = Object.keys(requirement)[0];
        security = this.components.securitySchemes[key];
      } catch (e) {
        return false;
      }

      if (!security) return false;
      let type = security.type;
      if (security.type === 'http' && security.scheme === 'basic') {
        type = 'Basic';
      } else if (security.type === 'oauth2') {
        type = 'OAuth2';
      } else if (security.type === 'apiKey' && security.in === 'query') {
        type = 'Query';
      } else if (security.type === 'apiKey' && security.in === 'header') {
        type = 'Header';
      }

      security._key = key;
      return { type, security };
    }).filter(Boolean).reduce((prev, next) => {
      if (!prev[next.type]) prev[next.type] = [];
      prev[next.type].push(next.security);
      return prev;
    }, {});
  }
}

module.exports = Oas;

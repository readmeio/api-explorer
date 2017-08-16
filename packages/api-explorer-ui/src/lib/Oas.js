const getPathOperation = require('./get-path-operation');

class Oas {
  constructor(oas) {
    Object.assign(this, oas);
  }

  hasAuth(path, method) {
    const operation = getPathOperation(this, { swagger: { path }, api: { method } });

    const security = operation.security || this.security;
    return !!(security && security.length);
  }

  getPathOperation(doc) {
    return getPathOperation(this, doc);
  }
}

module.exports = Oas;

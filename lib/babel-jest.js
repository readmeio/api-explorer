const babelJest = require('babel-jest');
const path = require('path');
const babelRc = JSON.parse(require('fs').readFileSync(path.join(__dirname, '..', '.babelrc'), 'utf8'));

module.exports = babelJest.createTransformer(babelRc);

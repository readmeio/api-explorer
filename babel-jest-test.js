const babelJest = require('babel-jest');
const babelRc = JSON.parse(require('fs').readFileSync(__dirname + '/.babelrc', 'utf8'));

module.exports = babelJest.createTransformer(babelRc);

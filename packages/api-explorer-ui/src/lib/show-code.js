const extensions = require('readme-oas-extensions');
const showCodeExamples = require('./show-code-examples');
const showCodeResults = require('./show-code-results');

module.exports = function (swagger, pathOperation) {
  const hasExamples = showCodeExamples(pathOperation).length;
  const hasResults = showCodeResults(pathOperation).length;
  const hasTryItNow = swagger[extensions.EXPLORER_ENABLED];

  return hasExamples || hasResults || hasTryItNow;
};

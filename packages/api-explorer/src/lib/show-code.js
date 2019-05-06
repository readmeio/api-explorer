const extensions = require('@mia-platform/oas-extensions');
const showCodeExamples = require('./show-code-examples');
const showCodeResults = require('./show-code-results');

module.exports = (oas, pathOperation) => {
  const hasExamples = showCodeExamples(pathOperation).length;
  const hasResults = showCodeResults(pathOperation).length;
  const hasTryItNow = oas[extensions.EXPLORER_ENABLED];

  return hasExamples || hasResults || hasTryItNow;
};

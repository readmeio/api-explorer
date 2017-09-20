const React = require('react');
const ReactDOM = require('react-dom');
const refParser = require('json-schema-ref-parser');

const oas = require('../packages/api-explorer-ui/__tests__/fixtures/petstore/oas');
const createDocs = require('../packages/api-explorer-ui/lib/create-docs');

const ApiExplorer = require('../packages/api-explorer-ui/src/index.jsx');

(async function main() {
  const docs = createDocs(oas, 'api-setting');
  const oasFiles = { 'api-setting': await refParser.dereference(oas) };

  ReactDOM.render(<ApiExplorer docs={docs} oasFiles={oasFiles} flags={{ correctnewlines: true }} />, document.getElementById('hub-reference'));
}());

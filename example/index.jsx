const React = require('react');
const ReactDOM = require('react-dom');
const refParser = require('json-schema-ref-parser');

const swagger = require('../packages/api-explorer-ui/__tests__/fixtures/petstore/swagger');
const createDocs = require('../packages/api-explorer-ui/lib/create-docs');

const ApiExplorer = require('../packages/api-explorer-ui');

(async function main() {
  const oas = await fetch('http://localhost:4000', {
    method: 'post',
    body: JSON.stringify(swagger),
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  }).then(response => response.json());

  const docs = createDocs(oas, 'api-setting');
  const oasFiles = { 'api-setting': await refParser.dereference(oas) };

  ReactDOM.render(<ApiExplorer docs={docs} oasFiles={oasFiles} />, document.getElementById('hub-reference'));
}());

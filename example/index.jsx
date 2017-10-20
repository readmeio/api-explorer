const React = require('react');
const ReactDOM = require('react-dom');
const fs = require('fs');
const path = require('path');
const CircularJSON = require('circular-json');

const oas = fs.readFileSync(path.join(__dirname, '/../packages/api-explorer-ui/__tests__/fixtures/example-results/circular-oas.json'), 'utf8');
const createDocs = require('../packages/api-explorer-ui/lib/create-docs');

const ApiExplorer = require('../packages/api-explorer-ui/src/index.jsx');

const parsed = CircularJSON.parse(oas);
const docs = createDocs(parsed, 'api-setting');
const oasFiles = { 'api-setting': parsed };

ReactDOM.render(<ApiExplorer docs={docs} oasFiles={oasFiles} flags={{ correctnewlines: false }} />, document.getElementById('hub-reference'));

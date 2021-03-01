/* eslint-disable no-console */
// Run this to use a ton of memory, and write absolutely every bit of output to the file AND your terminal so you can watch progress
// npx --max-old-space-size=18000 jest __tests__/test-all-oas.test.jsx 2>&1 | tee testOutput.txt

const React = require('react');
const Oas = require('oas/tooling');
const { ApiExplorer } = require('../src');

const fs = require('fs');
const path = require('path');

const extensions = require('../../oas-extensions');
const createDocs = require('./__fixtures__/create-docs');

const { Button, Tabs } = require('@readme/ui/.bundles/es/ui/components');
const { TutorialModal, TutorialTile } = require('@readme/ui/.bundles/es/ui/compositions');
const { cmVariableContext: TutorialVariableContext } = require('@readme/ui/.bundles/es/views');
const { DEFAULT_TUTORIAL } = require('@readme/ui/.bundles/es/ui/compositions/Tutorials/Modal/constants/stepDefaults');

const ReactDOMServer = require('react-dom/server');

const defaultProps = {
  glossaryTerms: [],
  suggestedEdits: false,
  variables: { user: {}, defaults: [] },
  maskErrorMessages: false,
  dontLazyLoad: true,
  ui: {
    Button,
    Tabs,
    tutorials: {
      DEFAULT_TUTORIAL,
      TutorialModal,
      TutorialTile,
      TutorialVariableContext,
    },
  },
};

/**
 * Turn an oas file into apiexplorer props
 */
async function getProps(oas) {
  // Manual apis are recorded in json as apiexplorer props. This is only valid for the example swagger files
  if (oas.oasFiles) {
    // Sometimes we don't have the defaults, fix that
    return Object.assign(defaultProps, oas);
  }

  const props = Object.assign(defaultProps, {
    appearance: {},
    flags: {},
    oasFiles: {},
    oasUrls: {
      'test-api-setting': 'https://example.com/openapi.json',
    },
    shouldDereferenceOas: false,
  });

  const oasObject = new Oas({ ...oas, [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'] });
  await oasObject.dereference();

  const { user, ...definition } = oasObject;

  props.docs = createDocs(definition, 'test-api-setting');
  props.oasFiles['test-api-setting'] = definition;

  return props;
}

async function testOasJSON(oas) {
  return ReactDOMServer.renderToString(React.createElement(ApiExplorer, await getProps(oas)));
}

// Test the examples
const folderPath = path.join(__dirname, '../../../example/swagger-files');

// Test your local directory, filled with oas files via scanOasForExplorer
// const folderPath = '/Users/aaronhedges/oasFileDump';
const debugPath = false;
const dir = fs.readdirSync(folderPath);
const paths = [];

// Find all filenames
// eslint-disable-next-line no-restricted-syntax
for (const oasFilename of dir) {
  // This is a non-oas file in the swagger-files folder. Ignore it.
  if (oasFilename === 'directory.json') {
    // eslint-disable-next-line no-continue
    continue;
  }

  paths.push([oasFilename]);
}

paths.sort();
// Usefull line to reduce the amount of files we process
// paths = paths.slice(0, 1000);

// Useful code to catch additional errors and ignore warnings
const standardWarn = console.warn;
const standardErr = console.error;

beforeEach(() => {
  console.error = err => {
    throw new Error(err);
  };

  console.warn = () => {};
});

afterEach(() => {
  console.err = standardErr;
  console.warn = standardWarn;
});

// DO NOT RUN THIS WITH CONCURRENT. IT BREAKS, BAD.
test.each(paths)('should load %s fine', async filename => {
  if (debugPath) fs.appendFileSync(debugPath, `${filename}\n`);
  const html = await testOasJSON(JSON.parse(fs.readFileSync(path.join(folderPath, filename))));
  expect(html).not.toContain('currently experiencing difficulties');
});

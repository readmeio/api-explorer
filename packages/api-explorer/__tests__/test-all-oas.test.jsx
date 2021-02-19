// Run this to use a ton of memory, and write absolutely every bit of output to the file AND your terminal so you can watch progress
// npx --max-old-space-size=18000 jest __tests__/test-all-oas.test.jsx 2>&1 | tee testOutput.txt
const React = require('react');
const { mount } = require('enzyme');
const { act } = require('react-dom/test-utils');
const Oas = require('oas/tooling');
const APIExplorer = require('../src');

const fs = require('fs');
const path = require('path');

const extensions = require('../../oas-extensions');
const createDocs = require('./__fixtures__/create-docs');

// https://github.com/enzymejs/enzyme/issues/2073#issuecomment-565736674 (note, doesn't work in tests on its own. requires fake timers as seen in testOasJSON)
const waitForComponentToPaint = async wrapper => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();
  });
};

const defaultProps = {
  glossaryTerms: [],
  suggestedEdits: false,
  variables: { user: {}, defaults: [] },
  maskErrorMessages: false,
  dontLazyLoad: true,
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

  const props = {
    appearance: {},
    flags: {},
    glossaryTerms: [],
    oasFiles: {},
    oasUrls: {
      'test-api-setting': 'https://example.com/openapi.json',
    },
    shouldDereferenceOas: false,
    suggestedEdits: false,
    variables: { user: {}, defaults: [] },
    maskErrorMessages: false,
  };

  const oasObject = new Oas({ ...oas, [extensions.SAMPLES_LANGUAGES]: ['node', 'curl'] });
  await oasObject.dereference();

  const { user, ...definition } = oasObject;

  props.docs = createDocs(definition, 'test-api-setting');
  props.oasFiles['test-api-setting'] = definition;

  return props;
}

async function testOasJSON(oas) {
  // necessary for waitForComponentToPaint to properly get act working
  jest.useFakeTimers();
  const doc = mount(React.createElement(APIExplorer, await getProps(oas)));
  await waitForComponentToPaint(doc);
  // necessary for waitForComponentToPaint to properly get act working
  jest.runOnlyPendingTimers();
  expect(doc.html()).not.toContain('currently experiencing difficulties');
}

// TODO: apis guru

// Test the examples
// const folderPath = path.join(__dirname, '../../../example/swagger-files');

// Test your local directory, filled with oas files via scanOasForExplorer
const folderPath = '/Users/aaronhedges/oasFileDump';

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

test.each(paths)('should load %s fine', async filename => {
  console.log(`checking ${filename}`);
  await testOasJSON(JSON.parse(fs.readFileSync(path.join(folderPath, filename))));
});

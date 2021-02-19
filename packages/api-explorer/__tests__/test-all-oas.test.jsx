// Run this to use a ton of memory, and write absolutely every bit of output to the file AND your terminal so you can watch progress
// npx --max-old-space-size=18000 jest __tests__/test-all-oas.test.jsx 2>&1 | tee testOutput.txt
const React = require('react');
const { mount } = require('enzyme');
const { act } = require('react-dom/test-utils');
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
  jest.useFakeTimers();
  // necessary for waitForComponentToPaint to properly get act working
  const doc = mount(React.createElement(ApiExplorer, await getProps(oas)));
  // necessary to ensure the react element is properly rendered before we create the html
  waitForComponentToPaint(doc);
  // run the timers (from react and waitForComponent)
  jest.runOnlyPendingTimers();
  return doc.html();
}

// TODO: apis guru

// Test the examples
// const folderPath = path.join(__dirname, '../../../example/swagger-files');

// Test your local directory, filled with oas files via scanOasForExplorer
const folderPath = '/Users/aaronhedges/oasFileDump';
const dir = fs.readdirSync(folderPath);
let paths = [];

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

// paths = [paths[0]];
console.log('running tests');

test.each(paths)('should load %s fine', async filename => {
  console.log(`testing ${filename}`);
  const html = await testOasJSON(JSON.parse(fs.readFileSync(path.join(folderPath, filename))));
  expect(html).not.toContain('currently experiencing difficulties');
});

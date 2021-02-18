const React = require('react');
const { mount } = require('enzyme');
const { act } = require('react-dom/test-utils');
const Oas = require('oas/tooling');
// const createParams = require('../src/Params');
const APIExplorer = require('../src');

const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '../../../example/swagger-files');
// const folderPath = '/Users/aaronhedges/oasFileDump';
const dir = fs.readdirSync(folderPath);
const extensions = require('../../oas-extensions');
const createDocs = require('./__fixtures__/create-docs');

function wait(amount = 0) {
  return new Promise(resolve => setTimeout(resolve, amount));
}

async function actWait(amount = 0) {
  await act(async () => {
    await wait(amount);
  });
}

async function getProps(oas) {
  if (oas.oasFiles) {
    return oas;
  }

  const languages = ['node', 'curl'];
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

  const oasObject = new Oas({ ...oas, [extensions.SAMPLES_LANGUAGES]: languages });
  await oasObject.dereference();

  const { user, ...definition } = oasObject;

  props.docs = createDocs(definition, 'test-api-setting');
  props.oasFiles['test-api-setting'] = definition;

  return props;
}

const defaultProps = {
  glossaryTerms: [],
  suggestedEdits: false,
  variables: { user: {}, defaults: [] },
  maskErrorMessages: false,
};

async function testOasJSON(oas) {
  const doc = mount(React.createElement(APIExplorer, Object.assign(defaultProps, await getProps(oas))));
  // Enzyme doesn't automatically wrap our mounted component in `act()` so we need to do some hocus pocus here to get
  // ReactDOM from throwing the following error:
  //
  //    Warning: An update to DocAsync inside a test was not wrapped in act(...).
  //
  // https://github.com/enzymejs/enzyme/issues/2073#issuecomment-531488981
  await actWait();
  expect(doc.html()).not.toContain('currently experiencing difficulties');
}

// eslint-disable-next-line jest/expect-expect
test('should load fine', async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const oasFilename of dir) {
    // eslint-disable-next-line jest/no-if
    if (oasFilename === 'directory.json') {
      continue;
    }

    console.log('checking ' + oasFilename);
    await testOasJSON(JSON.parse(fs.readFileSync(path.join(folderPath, oasFilename))));
  }
});

const React = require('react');
const { mount } = require('enzyme');
const Oas = require('oas/tooling');
const createParams = require('../src/Params');
const fs = require('fs');
const path = require('path');

const folderPath = '/Users/aaronhedges/oasFileDump';
const dir = fs.readdirSync(folderPath);

test('should load fine', () => {
  dir.forEach(oasFilename => {
    const oasFile = fs.readFileSync(path.join(folderPath, oasFilename));
    const oas = new Oas(oasFile);
    const operation = oas.operation('/pet/{petId}', 'get');

    const props = {
      oas,
      onChange: () => {},
      onJsonChange: () => {},
      onModeChange: () => {},
      onSubmit: () => {},
      operation,
      resetForm: () => {},
      onError: e => {
        console.log('error');
        throw e;
      },
    };

    const Params = createParams(oas, operation);
    let params;

    try {
      params = mount(React.createElement(Params, props));
    } catch (e) {
      console.log(`file ${oasFilename} failed`);
    }
    expect(params).toBeDefined();
  });
});

const React = require('react');
const { mount } = require('enzyme');
const Oas = require('oas/tooling');
const createParams = require('../src/Params');
const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '../../../example/swagger-files');
// const folderPath = '/Users/aaronhedges/oasFileDump';
const dir = fs.readdirSync(folderPath);

function testOasObject(oas, oasFile) {
  Object.keys(oasFile.paths).forEach(path => {
    Object.keys(oasFile.paths[path]).forEach(method => {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        return;
      }

      console.log('checking ' + path + ' ' + method);
      const operation = oas.operation(path, method);
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

      params = mount(React.createElement(Params, props));
      expect(params.html()).not.toContain('currently experiencing difficulties');
    });
  });
}

test('should load fine', async () => {
  for (const oasFilename of dir) {
    console.log('checking ' + oasFilename);
    const oasFile = JSON.parse(fs.readFileSync(path.join(folderPath, oasFilename)));
    let oas = null;

    if (oasFile.paths) {
      oas = new Oas(oasFile);
      await oas.dereference();
      testOasObject(oas, oasFile);
    } else if (oasFile.oasFiles) {
      for (const key of Object.keys(oasFile.oasFiles)) {
        console.log('checking ' + key);
        oas = new Oas(oasFile.oasFiles[key]);
        await oas.dereference();
        testOasObject(oas, oasFile.oasFiles[key]);
      }
    }
  };
});

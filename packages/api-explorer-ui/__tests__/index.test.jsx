const React = require('react');
const { shallow } = require('enzyme');
const ApiExplorer = require('../src');

const oas = require('./fixtures/petstore/swagger');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'api-setting');

test('ApiExplorer renders a doc for each', () => {
  const explorer = shallow(
    <ApiExplorer docs={docs} oasFiles={[{ 'api-setting': oas }]} />,
  );

  expect(explorer.find('Doc').length).toBe(docs.length);
});

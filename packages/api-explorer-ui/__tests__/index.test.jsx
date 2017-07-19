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

  // expect(checkbox.text()).toEqual('Off');

  // checkbox.find('input').simulate('change');

  // expect(checkbox.text()).toEqual('On');
});

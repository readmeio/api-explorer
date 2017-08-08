const React = require('react');
const { shallow } = require('enzyme');
const PathUrl = require('../src/PathUrl');

const swagger = require('../../../legacy-stuff/swagger');

const oas = require('./fixtures/petstore/oas');

const path = '/pet/{petId}';
const method = 'get';
const operation = oas.paths[path][method];

test('should display the path', () => {
  const pathUrl = shallow(
    <PathUrl oas={oas} path={path} method={method} operation={operation} />,
  );

  expect(pathUrl.find('span.url').text()).toBe(oas.servers[0].url);
  expect(pathUrl.find('span.api-text').text()).toBe('/pet/');
  expect(pathUrl.find('span.api-variable').text()).toBe('petId');
});

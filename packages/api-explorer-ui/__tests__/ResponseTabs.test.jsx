const React = require('react');
const { shallow } = require('enzyme');
// const extensions = require('../../readme-oas-extensions');
const petstore = require('./fixtures/petstore/oas');

const parseResponse = require('../src/lib/parse-response');
const FetchResponse = require('node-fetch').Response;

const ResponseTabs = require('../src/ResponseTabs');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);
const props = {
  operation: new Operation({}, '/pet', 'post'),
};

beforeEach(async () => {
  props.result = await parseResponse(
    {
      log: {
        entries: [
          { request: { url: 'http://petstore.swagger.io/v2/pet', method: 'POST', headers: [] } },
        ],
      },
    },
    new FetchResponse('{}', {
      headers: {},
    }),
  );
});

describe('tabs', () => {
  test('should switch tabs', () => {
    const responseTabs = shallow(<ResponseTabs {...props} oas={oas} />);

    const resultTab = responseTabs.find('a[data-tab="result"]');
    const metadataTab = responseTabs.find('a[data-tab="metadata"]');

    expect(responseTabs.prop('responseTab')).toBe('result');
    expect(resultTab.hasClass('selected')).toEqual(true);

    metadataTab.simulate('click', { preventDefault() {} });

    expect(responseTabs.prop('responseTab')).toBe('metadata');
    expect(responseTabs.find('a[data-tab="result"]').hasClass('selected')).toEqual(false);

    resultTab.simulate('click', { preventDefault() {} });
    expect(responseTabs.prop('responseTab')).toBe('result');
  });
});

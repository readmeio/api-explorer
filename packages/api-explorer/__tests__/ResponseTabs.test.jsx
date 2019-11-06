const React = require('react');
const { shallow, mount } = require('enzyme');
const FetchResponse = require('node-fetch').Response;
const petstore = require('./fixtures/petstore/oas');
const exampleResults = require('./fixtures/example-results/oas');

const parseResponse = require('../src/lib/parse-response');

const ResponseTabs = require('../src/ResponseTabs');
const Oas = require('../src/lib/Oas');

const oas = new Oas(petstore);
const props = {
  oas,
  operation: oas.operation('/pet', 'post'),
  responseTab: 'result',
  setTab: () => {},
  hideResults: () => {},
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

test('should show result/metadata tab', () => {
  const exampleTabs = shallow(<ResponseTabs {...props} />);

  expect(exampleTabs.find('Tab').length).toBe(2);
});

test('should select matching tab by name', () => {
  const exampleTabs = mount(<ResponseTabs {...props} />);

  expect(
    exampleTabs
      .find('a')
      .at(0)
      .hasClass('selected'),
  ).toEqual(true);
});

test('should not have a "back to examples" button if no examples', () => {
  const exampleTabs = shallow(<ResponseTabs {...props} />);

  expect(exampleTabs.find('a.pull-right').length).toEqual(0);
});

test('should call setTab() on click', () => {
  const setTab = jest.fn();
  const exampleTabs = mount(<ResponseTabs {...props} setTab={setTab} />);

  exampleTabs
    .find('a')
    .at(1)
    .simulate('click', { preventDefault() {} });

  expect(setTab.mock.calls[0][0]).toEqual('metadata');
});

test('should call hideResults() on click', () => {
  const hideResults = jest.fn();
  const exampleResultsOas = new Oas(exampleResults);
  const exampleTabs = shallow(
    <ResponseTabs
      {...props}
      oas={exampleResultsOas}
      operation={exampleResultsOas.operation('/results', 'get')}
      hideResults={hideResults}
    />,
  );

  exampleTabs.find('a.pull-right').simulate('click', { preventDefault() {} });

  expect(hideResults).toBeCalled();
});

test('should display status code for response', () => {
  const exampleTabs = shallow(<ResponseTabs {...props} />);

  expect(exampleTabs.find('IconStatus').length).toBe(1);
});

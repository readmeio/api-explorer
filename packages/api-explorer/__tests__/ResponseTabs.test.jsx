const React = require('react');
const { shallow, mount } = require('enzyme');
const { waitFor } = require('@testing-library/dom');
const FetchResponse = require('node-fetch').Response;
const Oas = require('oas/tooling');

const petstore = require('@readme/oas-examples/3.0/json/petstore.json');

const parseResponse = require('../src/lib/parse-response');
const ResponseTabs = require('../src/ResponseTabs');

const oas = new Oas(petstore);
const props = {
  hideResults: () => {},
  operation: oas.operation('/pet', 'post'),
  responseTab: 'result',
  setTab: () => {},
};

beforeEach(async () => {
  props.result = await parseResponse(
    {
      log: {
        entries: [{ request: { url: 'http://petstore.swagger.io/v2/pet', method: 'POST', headers: [] } }],
      },
    },
    new FetchResponse('{}', {
      headers: {},
    })
  );
});

test('should show result/metadata tab', () => {
  const comp = shallow(<ResponseTabs {...props} />);

  expect(comp.find('Tab')).toHaveLength(2);
});

test('should select matching tab by name', () => {
  const comp = mount(<ResponseTabs {...props} />);

  expect(comp.find('a').at(0).hasClass('selected')).toBe(true);
});

test('should not have a "back to examples" button if no examples', () => {
  const comp = shallow(<ResponseTabs {...props} />);

  expect(comp.find('a.pull-right')).toHaveLength(0);
});

test('should call setTab() on click', () => {
  const setTab = jest.fn();
  const comp = mount(<ResponseTabs {...props} setTab={setTab} />);

  comp
    .find('a')
    .at(1)
    .simulate('click', { preventDefault() {} });

  expect(setTab.mock.calls[0][0]).toBe('metadata');
});

test('should call hideResults() on click', () => {
  const hideResults = jest.fn();
  const comp = shallow(<ResponseTabs {...props} hideResults={hideResults} />);

  return waitFor(() => {
    comp.update();

    comp.find('a.pull-right').simulate('click', { preventDefault() {} });

    expect(hideResults).toHaveBeenCalled();
  });
});

test('should display status code for response', () => {
  const comp = shallow(<ResponseTabs {...props} />);

  expect(comp.find('IconStatus')).toHaveLength(1);
});

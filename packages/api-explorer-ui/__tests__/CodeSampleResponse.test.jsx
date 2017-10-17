const React = require('react');
const { shallow } = require('enzyme');
// const extensions = require('../../readme-oas-extensions');
const petstore = require('./fixtures/petstore/oas');

const CodeSampleResponseTabs = require('../src/CodeSampleResponse');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);
const props = {
  result: {
    init: true,
    isBinary: false,
    method: 'POST',
    requestHeaders: 'Authorization : Bearer api-key',
    responseHeaders: 'content-disposition,application/json',
    statusCode: [200, 'OK', 'success'],
    responseBody: {
      id: 9205436248879918000,
      category: { id: 0 },
      name: '1',
      photoUrls: ['1'],
      tags: [],
    },
    url: 'http://petstore.swagger.io/v2/pet',
  },
  operation: new Operation({}, '/pet', 'post'),
  styleClass: 'hub-reference-right hub-reference-results tabber-parent on',
};

describe('setTab', () => {
  test('setTab should change state of selectedTab', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props} oas={oas} />);

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('result');

    codeSampleResponseTabs.instance().setTab('metadata');

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('metadata');

    codeSampleResponseTabs.instance().setTab('result');

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('result');
  });
});

describe('no result', () => {
  test('empty span should render', () => {
    const noResult = {
      result: null,
      operation: new Operation({}, '/pet', 'post'),
      styleClass: 'hub-reference-right hub-reference-results tabber-parent on',
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...noResult} oas={oas} />);

    expect(codeSampleResponseTabs.find('span').length).toBe(0);
  });
});

describe('tabs', () => {
  test('should switch tabs', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props} oas={oas} />);

    const resultTab = codeSampleResponseTabs.find('a').first();
    const metadataTab = codeSampleResponseTabs.find('a').last();

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('result');
    expect(resultTab.hasClass('hub-reference-results-header-item tabber-tab selected')).toEqual(
      true,
    );

    metadataTab.simulate('click', { preventDefault() {} });

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('metadata');
    expect(resultTab.hasClass('hub-reference-results-header-item tabber-tab')).toEqual(true);

    resultTab.simulate('click', { preventDefault() {} });
    expect(codeSampleResponseTabs.state('selectedTab')).toBe('result');
  });
});

describe('Results body', () => {
  test('should display result body by default', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props} oas={oas} />);

    expect(codeSampleResponseTabs.find('pre.tomorrow-night').length).toBe(1);
  });

  test('should not display responseBody if isBinary is true', () => {
    const props2 = {
      result: {
        init: true,
        isBinary: true,
        method: 'POST',
        requestHeaders: 'Authorization : Bearer api-key',
        responseHeaders: 'content-disposition,application/json',
        statusCode: [200, 'OK', 'success'],
        url: 'http://petstore.swagger.io/v2/pet',
      },
      operation: new Operation({}, '/pet', 'post'),
      styleClass: 'hub-reference-right hub-reference-results tabber-parent on',
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props2} oas={oas} />);

    expect(
      codeSampleResponseTabs.containsMatchingElement(<div> A binary file was returned</div>),
    ).toEqual(true);
  });

  test('should display message if OAuth is incorrect or expired ', () => {
    const props3 = {
      result: {
        init: true,
        isBinary: true,
        method: 'POST',
        requestHeaders: 'Authorization : Bearer api-key',
        responseHeaders: 'content-disposition,application/json',
        statusCode: [401, 'Unauthorized', 'error'],
        responseBody: {
          id: 9205436248879918000,
          category: { id: 0 },
          name: '1',
          photoUrls: ['1'],
          tags: [],
        },
        url: 'http://petstore.swagger.io/v2/pet',
      },
      operation: new Operation({}, '/pet', 'post'),
      styleClass: 'hub-reference-right hub-reference-results tabber-parent on',
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props3} oas={oas} />);

    expect(
      codeSampleResponseTabs.containsMatchingElement(
        <div className="text-center hub-expired-token" />,
      ),
    ).toEqual(true);
  });
});

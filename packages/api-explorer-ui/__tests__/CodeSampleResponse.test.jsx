const React = require('react');
const { shallow } = require('enzyme');
// const extensions = require('../../readme-oas-extensions');
const petstore = require('./fixtures/petstore/oas');
const example = require('./fixtures/example-results/oas');
const parseResponse = require('../src/lib/parse-response');
const { Response } = require('node-fetch');

const CodeSampleResponseTabs = require('../src/CodeSampleResponse');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);
const props = {
  operation: new Operation({}, '/pet', 'post'),
};

const noResult = {
  result: null,
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
    new Response('{}', {
      headers: {},
    }),
  );
});

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

describe('exampleTab', () => {
  test('exampleTab should change state of exampleTab', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props} oas={oas} />);

    expect(codeSampleResponseTabs.state('exampleTab')).toBe(0);

    codeSampleResponseTabs.instance().exampleTab(1);

    expect(codeSampleResponseTabs.state('exampleTab')).toBe(1);
  });
});

describe('hideResults', () => {
  test('hideResults should render null', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props} oas={oas} />);

    expect(codeSampleResponseTabs.state('result')).toEqual(props.result);

    codeSampleResponseTabs.instance().hideResults();

    expect(codeSampleResponseTabs.state('result')).toBe(null);
  });
});

describe('no result', () => {
  test('empty span should render', () => {
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

    expect(
      codeSampleResponseTabs.containsMatchingElement(
        <div className="cm-s-tomorrow-night codemirror-highlight" />,
      ),
    ).toEqual(true);
  });

  test('should not display responseBody if isBinary is true', async () => {
    const props2 = {
      result: await parseResponse(
        {
          log: {
            entries: [
              {
                request: { url: 'http://petstore.swagger.io/v2/pet', method: 'POST', headers: [] },
              },
            ],
          },
        },
        new Response('{}', {
          headers: { 'content-disposition': 'attachment' },
        }),
      ),
      operation: new Operation({}, '/pet', 'post'),
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props2} oas={oas} />);

    expect(
      codeSampleResponseTabs.containsMatchingElement(<div> A binary file was returned</div>),
    ).toEqual(true);
  });

  test('should display message if OAuth is incorrect or expired ', () => {
    const props3 = {
      result: {
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
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props3} oas={oas} />);

    expect(
      codeSampleResponseTabs.containsMatchingElement(
        <div className="text-center hub-expired-token" />,
      ),
    ).toEqual(true);
  });
});

describe('examples', () => {
  test('if endpoint has an example tabs and body should show', () => {
    const oas2 = new Oas(example);
    const props4 = {
      result: null,
      operation: oas2.operation('/results', 'get'),
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props4} oas={oas2} />);

    const firstTab = codeSampleResponseTabs.find('a').first();
    const secondTab = codeSampleResponseTabs.find('a').last();

    expect(codeSampleResponseTabs.state('exampleTab')).toBe(0);
    expect(firstTab.hasClass('hub-reference-results-header-item tabber-tab selected')).toEqual(
      true,
    );

    secondTab.simulate('click', { preventDefault() {} });

    expect(codeSampleResponseTabs.state('exampleTab')).toBe(1);
    expect(firstTab.hasClass('hub-reference-results-header-item tabber-tab')).toEqual(true);

    expect(firstTab.find('span.httpsuccess').length).toBe(1);
    expect(secondTab.find('span.httperror').length).toBe(1);

    expect(codeSampleResponseTabs.find('pre').length).toBe(2);
  });

  test('if endpoint does not have example ', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...noResult} oas={oas} />);

    expect(
      codeSampleResponseTabs.containsMatchingElement(<div>Try the API to see Results</div>),
    ).toEqual(true);
  });
});

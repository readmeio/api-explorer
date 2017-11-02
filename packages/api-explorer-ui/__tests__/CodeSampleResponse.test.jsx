const React = require('react');
const { shallow, mount } = require('enzyme');
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
  test('nothing should render', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...noResult} oas={oas} />);

    expect(codeSampleResponseTabs.find('span').length).toBe(0);
  });
});

describe('tabs', () => {
  test('should switch tabs', () => {
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props} oas={oas} />);

    const resultTab = codeSampleResponseTabs.find('a[data-tab="result"]');
    const metadataTab = codeSampleResponseTabs.find('a[data-tab="metadata"]');

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('result');
    expect(resultTab.hasClass('selected')).toEqual(true);

    metadataTab.simulate('click', { preventDefault() {} });

    expect(codeSampleResponseTabs.state('selectedTab')).toBe('metadata');
    expect(codeSampleResponseTabs.find('a[data-tab="result"]').hasClass('selected')).toEqual(false);

    resultTab.simulate('click', { preventDefault() {} });
    expect(codeSampleResponseTabs.state('selectedTab')).toBe('result');
  });
});

describe('Results body', () => {
  test('should display result body by default', () => {
    const codeSampleResponseTabs = mount(<CodeSampleResponseTabs {...props} oas={oas} />);

    expect(codeSampleResponseTabs.find('.cm-s-tomorrow-night.codemirror-highlight').length).toBe(1);
  });

  test('should not display responseBody if isBinary is true', async () => {
    const binaryResponse = {
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
    const codeSampleResponseTabs = mount(<CodeSampleResponseTabs {...binaryResponse} oas={oas} />);

    expect(
      codeSampleResponseTabs.containsMatchingElement(<div>A binary file was returned</div>),
    ).toEqual(true);
  });

  let oauthInvalidResponse;

  beforeEach(async () => {
    oauthInvalidResponse = {
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
          headers: {},
          status: 401,
        }),
      ),
      operation: oas.operation('/pet', 'post'),
    };
  });

  test('should display message if OAuth is incorrect or expired without oauthUrl', async () => {
    const codeSampleResponseTabs = mount(
      <CodeSampleResponseTabs {...oauthInvalidResponse} oas={oas} />,
    );

    expect(codeSampleResponseTabs.find('.hub-expired-token').length).toEqual(1);
    expect(
      codeSampleResponseTabs.containsMatchingElement(
        <p>Your OAuth2 token is incorrect or has expired</p>,
      ),
    ).toEqual(true);
  });

  test('should display message if OAuth is expired with oauthUrl', async () => {
    const codeSampleResponseTabs = mount(
      <CodeSampleResponseTabs
        {...oauthInvalidResponse}
        oas={oas}
        oauthUrl="https://github.com/readmeio/api-explorer"
      />,
    );

    expect(
      codeSampleResponseTabs.containsAllMatchingElements([
        <div>
          <p>Your OAuth2 token has expired</p>
          <a>Reauthenticate via OAuth2</a>
        </div>,
      ]),
    ).toEqual(true);
  });

  test('should display message authentication message if endpoint does not use oAuth', async () => {
    const nonOAuthInvalidResponse = {
      result: await parseResponse(
        {
          log: {
            entries: [
              {
                request: {
                  url: 'http://petstore.swagger.io/v2/pet/petId',
                  method: 'GET',
                  headers: [],
                },
              },
            ],
          },
        },
        new Response('{}', {
          headers: {},
          status: 401,
        }),
      ),
      operation: oas.operation('/pet/{petId}', 'get'),
    };
    const codeSampleResponseTabs = mount(
      <CodeSampleResponseTabs {...nonOAuthInvalidResponse} oas={oas} />,
    );

    expect(
      codeSampleResponseTabs.containsMatchingElement(<p>You couldn&apos;t be authenticated</p>),
    ).toEqual(true);
  });
});

describe('examples', () => {
  test('if endpoint has an example, tabs and body should show', () => {
    const oas2 = new Oas(example);
    const props4 = {
      result: null,
      operation: oas2.operation('/results', 'get'),
    };
    const codeSampleResponseTabs = shallow(<CodeSampleResponseTabs {...props4} oas={oas2} />);

    const firstTab = codeSampleResponseTabs.find('a').first();
    const secondTab = codeSampleResponseTabs.find('a').last();

    expect(codeSampleResponseTabs.state('exampleTab')).toBe(0);
    expect(firstTab.hasClass('selected')).toEqual(true);

    secondTab.simulate('click', { preventDefault() {} });

    expect(codeSampleResponseTabs.state('exampleTab')).toBe(1);
    expect(
      codeSampleResponseTabs
        .find('a')
        .first()
        .hasClass('selected'),
    ).toEqual(false);

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

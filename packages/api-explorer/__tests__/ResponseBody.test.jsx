const React = require('react');
const { mount } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');

const parseResponse = require('../src/lib/parse-response');
const FetchResponse = require('node-fetch').Response;

const ResponseBody = require('../src/ResponseBody');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);
const props = {
  operation: new Operation({}, '/pet', 'post'),
  oauth: false,
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

describe('Response body', () => {
  test('should display result body by default', () => {
    const responseBody = mount(<ResponseBody {...props} oas={oas} />);

    expect(responseBody.find('.cm-s-tomorrow-night.codemirror-highlight').length).toBe(1);
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
        new FetchResponse('{}', {
          headers: { 'content-disposition': 'attachment' },
        }),
      ),
      operation: new Operation({}, '/pet', 'post'),
      oauth: false,
    };
    const responseBody = mount(<ResponseBody {...binaryResponse} oas={oas} />);

    expect(responseBody.containsMatchingElement(<div>A binary file was returned</div>)).toEqual(
      true,
    );
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
        new FetchResponse('{}', {
          headers: {},
          status: 401,
        }),
      ),
      operation: oas.operation('/pet', 'post'),
      isOauth: true,
      oauth: false,
    };
  });

  test('should display message if OAuth is incorrect or expired without oauth', () => {
    const responseBody = mount(<ResponseBody {...oauthInvalidResponse} oas={oas} />);

    expect(responseBody.find('.hub-expired-token').length).toEqual(1);
    expect(
      responseBody.containsMatchingElement(<p>Your OAuth2 token is incorrect or has expired</p>),
    ).toEqual(true);
  });

  test('should display message if OAuth is expired with oauth', () => {
    const responseBody = mount(<ResponseBody {...oauthInvalidResponse} oas={oas} oauth />);

    expect(responseBody.find('p').text()).toBe('Your OAuth2 token has expired')
    expect(responseBody.find('a').text()).toBe('Reauthenticate via OAuth2')
    expect(responseBody.find('a').prop('href')).toBe(`/oauth?redirect=${window.location.pathname}`)
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
        new FetchResponse('{}', {
          headers: {},
          status: 401,
        }),
      ),
      operation: oas.operation('/pet/{petId}', 'get'),
      oauth: false,
    };
    const responseBody = mount(<ResponseBody {...nonOAuthInvalidResponse} oas={oas} />);

    expect(responseBody.containsMatchingElement(<p>You couldn&apos;t be authenticated</p>)).toEqual(
      true,
    );
  });
});

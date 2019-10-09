import { IntlProvider, FormattedMessage } from 'react-intl';
import {Icon} from 'antd'

import ResponseBody from '../src/components/Response';
import Result from '../src/components/Response/Result'

const React = require('react');
const { mount } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');

const parseResponse = require('../src/lib/parse-response');
const FetchResponse = require('node-fetch').Response;

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
      headers: {
        'content-type': 'application/json',
      },
    }),
  );
});

describe('Response body', () => {
  test('should display json viewer if response is json', () => {
    const responseBody = mount(<IntlProvider><ResponseBody {...props} oas={oas} /></IntlProvider>);

    expect(responseBody.find('.react-json-view').length).toBe(1);
  });

  test('should display json viewer if response is json with charset', async () => {
    props.result = await parseResponse(
      {
        log: {
          entries: [
            { request: { url: 'http://petstore.swagger.io/v2/pet', method: 'POST', headers: [] } },
          ],
        },
      },
      new FetchResponse('{}', {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      }),
    );

    const responseBody = mount(<IntlProvider><ResponseBody {...props} oas={oas} /></IntlProvider>);

    expect(responseBody.find('.react-json-view').length).toBe(1);
  });

  test('should not display json viewer if invalid json', async () => {
    props.result = await parseResponse(
      {
        log: {
          entries: [
            { request: { url: 'http://petstore.swagger.io/v2/pet', method: 'POST', headers: [] } },
          ],
        },
      },
      new FetchResponse('ok', {
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const responseBody = mount(<IntlProvider><ResponseBody {...props} oas={oas} /></IntlProvider>);

    expect(responseBody.find('.react-json-view').length).toBe(0);
    expect(responseBody.find('.cm-s-tomorrow-night.codemirror-highlight').length).toBe(1);
  });

  test('should not display json result if body is a string', async () => {
    props.result = await parseResponse(
      {
        log: {
          entries: [
            { request: { url: 'http://petstore.swagger.io/v2/pet', method: 'POST', headers: [] } },
          ],
        },
      },
      new FetchResponse(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><apiResponse><message>something bad happened</message><type>unknown</type></apiResponse>',
        {
          headers: {
            'content-type': 'application/xml',
          },
        },
      ),
    );

    const responseBody = mount(<IntlProvider><ResponseBody {...props} oas={oas} /></IntlProvider>);

    expect(responseBody.find('.react-json-view').length).toBe(0);
    expect(responseBody.find('.cm-s-tomorrow-night.codemirror-highlight').length).toBe(1);
    // Making sure it is syntax highlighted as xml
    expect(responseBody.html().indexOf('cm-meta') > -1).toBe(true);
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
    const responseBody = mount(<IntlProvider><ResponseBody {...binaryResponse} oas={oas} /></IntlProvider>);

    const message = responseBody.find(Icon);
    expect(message.prop('type')).toEqual('download');
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
    const responseBody = mount(<IntlProvider><ResponseBody {...oauthInvalidResponse} oas={oas} /></IntlProvider>);
    expect(responseBody.findWhere(node => node.prop('id') === 'api.oauth2.invalid')).toHaveLength(1);
  });

  test('should display Result if result.responseBody is set', () => {
    const responseBody = mount(<IntlProvider><ResponseBody {...oauthInvalidResponse} oas={oas} /></IntlProvider>);
    expect(responseBody.find(Result)).toHaveLength(1);
  });

  test('should not display Result if result.responseBody is not set', () => {
    const responseBody = mount(<IntlProvider><ResponseBody
      operation={oas.operation('/pet', 'post')}
      isOauth
      oauth={false}
      result={{
        status: 401,
        responseBody: null
      }}
      oas={oas}
    /></IntlProvider>);
    expect(responseBody.find(Result)).toHaveLength(0);
  });

  test('should display message if OAuth is expired with oauth', () => {
    const responseBody = mount(<IntlProvider><ResponseBody {...oauthInvalidResponse} oas={oas} oauth /></IntlProvider>);

    expect(responseBody.find('p').text()).toBe('Your OAuth2 token has expired');
    expect(responseBody.find('a.btn.btn-primary').text()).toBe('Reauthenticate via OAuth2');
    expect(responseBody.find('a.btn.btn-primary').prop('href')).toBe(`/oauth?redirect=${window.location.pathname}`);
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
    const responseBody = mount(<IntlProvider><ResponseBody {...nonOAuthInvalidResponse} oas={oas} /></IntlProvider>);

    const message = responseBody.find(FormattedMessage).at(1);
    expect(message.prop('id')).toEqual('api.auth.failed');
  });
});

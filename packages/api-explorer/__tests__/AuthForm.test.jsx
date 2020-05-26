import React from 'react';
import { shallowWithIntl, mountWithIntl } from 'enzyme-react-intl';

import AuthForm from '../src/components/AuthForm'

const props = {
  onChange: () => {},
  onSubmit: jest.fn(),
  toggle: () => {},
  open: false,
  oauth: false,
  auth: {},
};

test('should display a single span for single auth type', () => {
  // This object is retrieved from OAS library while running in prod.
  const securitySchemes = {
    "Header Auth":[{"type":"auth","flows":{"implicit":{"authorizationUrl":"http://petstore.swagger.io/oauth/dialog","scopes":{"write:pets":"modify pets in your account","read:pets":"read your pets"}}},"_key":"petstore_auth"}],  
  }
  const authForm = shallowWithIntl(<AuthForm {...props} securitySchemes={securitySchemes} />);
  const span = authForm.find('span')

  expect(span).toHaveLength(1)
  expect(span.text()).toEqual('Header Auth')
});

test('should display a span for each auth type', () => {
  // This object is retrieved from OAS library while running in prod.
  const securitySchemes = {
    "OAuth2 Auth":[{"type":"oauth2","flows":{"implicit":{"authorizationUrl":"http://petstore.swagger.io/oauth/dialog","scopes":{"write:pets":"modify pets in your account","read:pets":"read your pets"}}},"_key":"petstore_auth"}],
    "Header Auth":[{"type":"auth","flows":{"implicit":{"authorizationUrl":"http://petstore.swagger.io/oauth/dialog","scopes":{"write:pets":"modify pets in your account","read:pets":"read your pets"}}},"_key":"petstore_auth"}],  
  }

  const authForm = shallowWithIntl(<AuthForm {...props} securitySchemes={securitySchemes} />);
  const span = authForm.find('span')

  expect(span).toHaveLength(2)
  expect(span.map(elem => elem.text())).toEqual([
    'OAuth2 Auth',
    'Header Auth'
    ])
});

test('should display multiple securities', () => {
  // This object is retrieved from OAS library while running in prod.
  const securitySchemes = {  
    "Basic": [
      {
        "type": "http",
        "scheme": "basic",
        "user": "",
        "pass": "",
        "_key": "basic"
      }
    ]
  }
  const auth = {
    "basic": {
      "user": "",
      "pass": ""
    }
  }
  const authForm = mountWithIntl(<AuthForm {...props} auth={auth}securitySchemes={securitySchemes} />);

  expect(authForm.find('SecurityInput').length).toBe(1);
  expect(authForm.find('SecurityInput').prop('scheme')).toEqual(securitySchemes.Basic[0]);
});

test('on form submits calls onSubmit', () => {
  const securitySchemes = {
    "Header Auth":[{"type":"auth","flows":{"implicit":{"authorizationUrl":"http://petstore.swagger.io/oauth/dialog","scopes":{"write:pets":"modify pets in your account","read:pets":"read your pets"}}},"_key":"petstore_auth"}],  
  }
  const authForm = shallowWithIntl(<AuthForm {...props} securitySchemes={securitySchemes} />);
  const eventMock = {preventDefault: jest.fn()}
  authForm.find("form").prop('onSubmit')(eventMock)
  expect(eventMock.preventDefault).toHaveBeenCalledTimes(1)
  expect(props.onSubmit).toHaveBeenCalledTimes(1)
})
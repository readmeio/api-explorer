const configureSecurity = require('../../src/lib/configure-security');

describe('configure-security', () => {
  test('should return undefined if there is no security keys', () => {
    expect(typeof configureSecurity({}, {}, {}, {})).toBe('undefined');
  });

  describe('type=basic', () => {
    test('should work for basic type', () => {
      const headers = {};
      const username = 'username';
      const password = 'password';
      const scope = {
        apiAuth: {
          auth: {
            _basic_username: username,
            _basic_password: password,
          },
        },
      };

      configureSecurity({
        securitySchemes: { test: { type: 'basic' } },
      }, {}, headers, scope, { test: {} });

      expect(headers.Authorization).toBe(`Basic ${new Buffer(`${username}:${password}`).toString('base64')}`);
    });
  });

  describe('type=oauth2', () => {
    test('should work for oauth2', () => {
      const headers = {};
      const apiKey = '123456';
      const scope = { key: { api_key: apiKey } };

      configureSecurity({
        securitySchemes: { test: { type: 'oauth2' } },
      }, {}, headers, scope, { test: {} });

      expect(headers.Authorization).toBe(`Bearer ${apiKey}`);
    });
  });

  describe('type=apiKey', () => {
    describe('in=query', () => {
      test('should work for query', () => {
        const query = {};
        const scope = { apiAuth: { auth: { key: 'value' } } };
        const security = { type: 'apiKey', in: 'query', name: 'key' };

        configureSecurity({
          securitySchemes: { test: security },
        }, query, {}, scope, { test: {} });

        expect(query[security.name]).toBe(scope.apiAuth.auth[security.name]);
      });
    });

    describe('in=header', () => {
      test('should work for header', () => {
        const headers = {};
        const scope = { apiAuth: { auth: { key: 'value' } } };
        const security = { type: 'apiKey', in: 'header', name: 'key' };

        configureSecurity({
          securitySchemes: { test: security },
        }, {}, headers, scope, { test: {} });

        expect(headers[security.name]).toBe(scope.apiAuth.auth[security.name]);
      });

      describe('x-bearer-format', () => {
        test('should work for bearer', () => {
          const headers = {};
          const scope = { apiAuth: { auth: { key: 'value' } } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'bearer' };

          configureSecurity({
            securitySchemes: { test: security },
          }, {}, headers, scope, { test: {} });

          expect(headers[security.name]).toBe(`Bearer ${scope.apiAuth.auth[security.name]}`);
        });

        test('should work for basic', () => {
          const headers = {};
          const scope = { apiAuth: { auth: { key: 'value' } } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'basic' };

          configureSecurity({
            securitySchemes: { test: security },
          }, {}, headers, scope, { test: {} });

          expect(headers[security.name]).toBe(`Basic ${scope.apiAuth.auth[security.name]}`);
        });

        test('should work for token', () => {
          const headers = {};
          const scope = { apiAuth: { auth: { key: 'value' } } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'token' };

          configureSecurity({
            securitySchemes: { test: security },
          }, {}, headers, scope, { test: {} });

          expect(headers[security.name]).toBe(`Token ${scope.apiAuth.auth[security.name]}`);
        });
      });
    });
  });
});

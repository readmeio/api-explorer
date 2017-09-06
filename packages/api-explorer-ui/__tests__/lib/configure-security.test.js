const assert = require('assert');

const configureSecurity = require('../../src/lib/configure-security');

describe('configure-security', () => {
  it('should return undefined if there is no security keys', () => {
    assert.equal(typeof configureSecurity({}, {}, {}, {}), 'undefined');
  });

  describe('type=basic', () => {
    it('should work for basic type', () => {
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
        securityDefinitions: { test: { type: 'basic' } },
      }, {}, headers, scope, { test: {} });

      assert.equal(headers.Authorization, `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`);
    });
  });

  describe('type=oauth2', () => {
    it('should work for oauth2', () => {
      const headers = {};
      const apiKey = '123456';
      const scope = { key: { api_key: apiKey } };

      configureSecurity({
        securityDefinitions: { test: { type: 'oauth2' } },
      }, {}, headers, scope, { test: {} });

      assert.equal(headers.Authorization, `Bearer ${apiKey}`);
    });
  });

  describe('type=apiKey', () => {
    describe('in=query', () => {
      it('should work for query', () => {
        const query = {};
        const scope = { apiAuth: { auth: { key: 'value' } } };
        const security = { type: 'apiKey', in: 'query', name: 'key' };

        configureSecurity({
          securityDefinitions: { test: security },
        }, query, {}, scope, { test: {} });

        assert.equal(query[security.name], scope.apiAuth.auth[security.name]);
      });
    });

    describe('in=header', () => {
      it('should work for header', () => {
        const headers = {};
        const scope = { apiAuth: { auth: { key: 'value' } } };
        const security = { type: 'apiKey', in: 'header', name: 'key' };

        configureSecurity({
          securityDefinitions: { test: security },
        }, {}, headers, scope, { test: {} });

        assert.equal(headers[security.name], scope.apiAuth.auth[security.name]);
      });

      describe('x-bearer-format', () => {
        it('should work for bearer', () => {
          const headers = {};
          const scope = { apiAuth: { auth: { key: 'value' } } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'bearer' };

          configureSecurity({
            securityDefinitions: { test: security },
          }, {}, headers, scope, { test: {} });

          assert.equal(headers[security.name], `Bearer ${scope.apiAuth.auth[security.name]}`);
        });

        it('should work for basic', () => {
          const headers = {};
          const scope = { apiAuth: { auth: { key: 'value' } } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'basic' };

          configureSecurity({
            securityDefinitions: { test: security },
          }, {}, headers, scope, { test: {} });

          assert.equal(headers[security.name], `Basic ${scope.apiAuth.auth[security.name]}`);
        });

        it('should work for token', () => {
          const headers = {};
          const scope = { apiAuth: { auth: { key: 'value' } } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'token' };

          configureSecurity({
            securityDefinitions: { test: security },
          }, {}, headers, scope, { test: {} });

          assert.equal(headers[security.name], `Token ${scope.apiAuth.auth[security.name]}`);
        });
      });
    });
  });
});

const configureSecurity = require('../../src/lib/configure-security');

describe('configure-security', () => {
  test('should return {} if there is no security keys', () => {
    expect(configureSecurity({}, {}, {})).toEqual({});
  });

  test('should return undefined if no values', () => {
    const values = {};
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(configureSecurity({
      components: { securitySchemes: { test: security } },
    }, values, { test: {} })).toEqual(undefined);
  });

  test('should not return non-existent values', () => {
    const values = { auth: {} };
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(configureSecurity({
      components: { securitySchemes: { test: security } },
    }, values, { test: {} })).toEqual(undefined);
  });

  describe('type=basic', () => {
    test('should work for basic type', () => {
      const user = 'user';
      const password = 'password';
      const values = {
        auth: { user, password },
      };

      expect(configureSecurity({
        components: { securitySchemes: { test: { type: 'basic' } } },
      }, values, { test: {} })).toEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Basic ${new Buffer(`${user}:${password}`).toString('base64')}`,
        },
      });
    });
  });

  describe('type=oauth2', () => {
    test('should work for oauth2', () => {
      const apiKey = '123456';
      const values = {
        auth: { test: apiKey },
      };

      expect(configureSecurity({
        components: { securitySchemes: { test: { type: 'oauth2' } } },
      }, values, { test: {} })).toEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Bearer ${apiKey}`,
        },
      });
    });
  });

  describe('type=apiKey', () => {
    describe('in=query', () => {
      test('should work for query', () => {
        const values = { auth: { test: 'value' } };
        const security = { type: 'apiKey', in: 'query', name: 'key' };

        expect(configureSecurity({
          components: { securitySchemes: { test: security } },
        }, values, { test: {} })).toEqual({
          type: 'queryString',
          value: {
            name: security.name,
            value: values.auth.test,
          },
        });
      });
    });

    describe('in=header', () => {
      test('should work for header', () => {
        const values = { auth: { test: 'value' } };
        const security = { type: 'apiKey', in: 'header', name: 'key' };

        expect(configureSecurity({
          components: { securitySchemes: { test: security } },
        }, values, { test: {} })).toEqual({
          type: 'headers',
          value: {
            name: security.name,
            value: values.auth.test,
          },
        });
      });

      describe('x-bearer-format', () => {
        test('should work for bearer', () => {
          const values = { auth: { test: 'value' } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'bearer' };

          expect(configureSecurity({
            components: { securitySchemes: { test: security } },
          }, values, { test: {} })).toEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Bearer ${values.auth.test}`,
            },
          });
        });

        test('should work for basic', () => {
          const values = { auth: { test: 'value' } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'basic' };

          expect(configureSecurity({
            components: { securitySchemes: { test: security } },
          }, values, { test: {} })).toEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Basic ${values.auth.test}`,
            },
          });
        });

        test('should work for token', () => {
          const values = { auth: { test: 'value' } };
          const security = { type: 'apiKey', in: 'header', name: 'key', 'x-bearer-format': 'token' };

          expect(configureSecurity({
            components: { securitySchemes: { test: security } },
          }, values, { test: {} })).toEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Token ${values.auth.test}`,
            },
          });
        });
      });
    });
  });
});

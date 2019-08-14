const configureSecurity = require('../../src/lib/configure-security');

describe('configure-security', () => {
  test('should return {} if there is no security keys', () => {
    expect(configureSecurity({}, {}, '')).toEqual({});
  });

  test('should return undefined if no values', () => {
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(
      configureSecurity(
        {
          components: { securitySchemes: { test: security } },
        },
        {},
        'test',
      ),
    ).toEqual(undefined);
  });

  test('should not return non-existent values', () => {
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(
      configureSecurity(
        {
          components: { securitySchemes: { test: security } },
        },
        {},
        'test',
      ),
    ).toEqual(undefined);
  });

  describe('type=basic', () => {
    test('should work for basic type', () => {
      const user = 'user';
      const pass = 'pass';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'basic' } } },
          },
          { test: { user, pass } },
          'test',
        ),
      ).toEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Basic ${new Buffer(`${user}:${pass}`).toString('base64')}`,
        },
      });
    });

    test('should return with no header if user and password are blank', () => {
      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'basic' } } },
          },
          { test: { user: '', pass: '' } },
          'test',
        ),
      ).toEqual(false);
    });

    test('should return with a header if user or password are not blank', () => {
      const user = 'user';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'basic' } } },
          },
          { test: { user, pass: '' } },
          'test',
        ),
      ).toEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Basic ${new Buffer(`${user}:`).toString('base64')}`,
        },
      });
    });
  });

  describe('type=bearer', () => {
    test('should work for bearer', () => {
      const apiKey = '123456';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'bearer' } } },
          },
          { test: apiKey },
          'test',
        ),
      ).toEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Bearer ${apiKey}`,
        },
      });
    });

    test('should return with no header if apiKey is blank', () => {
      const values = {
        auth: { test: '' },
      };

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'bearer' } } },
          },
          values,
          'test',
        ),
      ).toEqual(false);
    });
  });

  describe('type=oauth2', () => {
    test('should work for oauth2', () => {
      const apiKey = '123456';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'oauth2' } } },
          },
          { test: apiKey },
          'test',
        ),
      ).toEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Bearer ${apiKey}`,
        },
      });
    });

    test('should return with no header if apiKey is blank', () => {
      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'oauth2' } } },
          },
          { test: '' },
          'test',
        ),
      ).toEqual(false);
    });
  });

  describe('type=apiKey', () => {
    describe('in=query', () => {
      test('should work for query', () => {
        const values = { test: 'value' };
        const security = { type: 'apiKey', in: 'query', name: 'key' };

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { test: security } },
            },
            values,
            'test',
          ),
        ).toEqual({
          type: 'queryString',
          value: {
            name: security.name,
            value: values.test,
          },
        });
      });
    });

    describe('in=header', () => {
      test('should work for header', () => {
        const values = { test: 'value' };
        const security = { type: 'apiKey', in: 'header', name: 'key' };

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { test: security } },
            },
            values,
            'test',
          ),
        ).toEqual({
          type: 'headers',
          value: {
            name: security.name,
            value: values.test,
          },
        });
      });

      describe('x-bearer-format', () => {
        test('should work for bearer', () => {
          const values = { test: 'value' };
          const security = {
            type: 'apiKey',
            in: 'header',
            name: 'key',
            'x-bearer-format': 'bearer',
          };

          expect(
            configureSecurity(
              {
                components: { securitySchemes: { test: security } },
              },
              values,
              'test',
            ),
          ).toEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Bearer ${values.test}`,
            },
          });
        });

        test('should work for basic', () => {
          const values = { test: 'value' };
          const security = {
            type: 'apiKey',
            in: 'header',
            name: 'key',
            'x-bearer-format': 'basic',
          };

          expect(
            configureSecurity(
              {
                components: { securitySchemes: { test: security } },
              },
              values,
              'test',
            ),
          ).toEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Basic ${values.test}`,
            },
          });
        });

        test('should work for token', () => {
          const values = { test: 'value' };
          const security = {
            type: 'apiKey',
            in: 'header',
            name: 'key',
            'x-bearer-format': 'token',
          };

          expect(
            configureSecurity(
              {
                components: { securitySchemes: { test: security } },
              },
              values,
              'test',
            ),
          ).toEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Token ${values.test}`,
            },
          });
        });
      });
    });
  });
});

const configureSecurity = require('../../src/lib/configure-security');

describe('configure-security', () => {
  it('should return {} if there is no security keys', () => {
    expect(configureSecurity({}, {}, '')).toStrictEqual({});
  });

  it('should return undefined if no values', () => {
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(
      configureSecurity(
        {
          components: { securitySchemes: { test: security } },
        },
        {},
        'test',
      ),
    ).toBeUndefined();
  });

  it('should not return non-existent values', () => {
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(
      configureSecurity(
        {
          components: { securitySchemes: { test: security } },
        },
        {},
        'test',
      ),
    ).toBeUndefined();
  });

  describe('type=basic', () => {
    it('should work for basic type', () => {
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
      ).toStrictEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
        },
      });
    });

    it('should return with no header if user and password are blank', () => {
      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'basic' } } },
          },
          { test: { user: '', pass: '' } },
          'test',
        ),
      ).toBe(false);
    });

    it('should return with a header if user or password are not blank', () => {
      const user = 'user';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'basic' } } },
          },
          { test: { user, pass: '' } },
          'test',
        ),
      ).toStrictEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Basic ${Buffer.from(`${user}:`).toString('base64')}`,
        },
      });
    });
  });

  describe('type=bearer', () => {
    it('should work for bearer', () => {
      const apiKey = '123456';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'http', scheme: 'bearer' } } },
          },
          { test: apiKey },
          'test',
        ),
      ).toStrictEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Bearer ${apiKey}`,
        },
      });
    });

    it('should return with no header if apiKey is blank', () => {
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
      ).toBe(false);
    });
  });

  describe('type=oauth2', () => {
    it('should work for oauth2', () => {
      const apiKey = '123456';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'oauth2' } } },
          },
          { test: apiKey },
          'test',
        ),
      ).toStrictEqual({
        type: 'headers',
        value: {
          name: 'Authorization',
          value: `Bearer ${apiKey}`,
        },
      });
    });

    it('should return with no header if apiKey is blank', () => {
      expect(
        configureSecurity(
          {
            components: { securitySchemes: { test: { type: 'oauth2' } } },
          },
          { test: '' },
          'test',
        ),
      ).toBe(false);
    });
  });

  describe('type=apiKey', () => {
    describe('in=query', () => {
      it('should work for query', () => {
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
        ).toStrictEqual({
          type: 'queryString',
          value: {
            name: security.name,
            value: values.test,
          },
        });
      });
    });

    describe('in=header', () => {
      it('should work for header', () => {
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
        ).toStrictEqual({
          type: 'headers',
          value: {
            name: security.name,
            value: values.test,
          },
        });
      });

      describe('x-bearer-format', () => {
        it('should work for bearer', () => {
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
          ).toStrictEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Bearer ${values.test}`,
            },
          });
        });

        it('should work for basic', () => {
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
          ).toStrictEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Basic ${values.test}`,
            },
          });
        });

        it('should work for token', () => {
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
          ).toStrictEqual({
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

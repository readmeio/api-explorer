const configureSecurity = require('../../src/lib/configure-security');

describe('configure-security', () => {
  it('should return an empty object if there is no security keys', () => {
    expect(configureSecurity({}, {}, '')).toStrictEqual({});
  });

  it('should return undefined if no values', () => {
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(
      configureSecurity(
        {
          components: { securitySchemes: { schemeName: security } },
        },
        {},
        'schemeName'
      )
    ).toBeUndefined();
  });

  it('should not return non-existent values', () => {
    const security = { type: 'apiKey', in: 'header', name: 'key' };

    expect(
      configureSecurity(
        {
          components: { securitySchemes: { schemeName: security } },
        },
        {},
        'schemeName'
      )
    ).toBeUndefined();
  });

  describe('http auth support', () => {
    describe('type=basic', () => {
      it('should work for basic type', () => {
        const user = 'user';
        const pass = 'pass';

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: { type: 'http', scheme: 'basic' } } },
            },
            { schemeName: { user, pass } },
            'schemeName'
          )
        ).toStrictEqual({
          type: 'headers',
          value: {
            name: 'Authorization',
            value: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
          },
        });
      });

      it('should return with no header if wanted scheme is missing', () => {
        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: { type: 'http', scheme: 'basic' } } },
            },
            { anotherSchemeName: { user: '', pass: '' } },
            'schemeName'
          )
        ).toBe(false);
      });

      it('should return with no header if user and password are blank', () => {
        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: { type: 'http', scheme: 'basic' } } },
            },
            { schemeName: { user: '', pass: '' } },
            'schemeName'
          )
        ).toBe(false);
      });

      it('should return with a header if user or password are not blank', () => {
        const user = 'user';

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: { type: 'http', scheme: 'basic' } } },
            },
            { schemeName: { user, pass: '' } },
            'schemeName'
          )
        ).toStrictEqual({
          type: 'headers',
          value: {
            name: 'Authorization',
            value: `Basic ${Buffer.from(`${user}:`).toString('base64')}`,
          },
        });
      });
    });

    describe('scheme `bearer`', () => {
      it('should work for bearer', () => {
        const apiKey = '123456';

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: { type: 'http', scheme: 'bearer' } } },
            },
            { schemeName: apiKey },
            'schemeName'
          )
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
              components: { securitySchemes: { schemeName: { type: 'http', scheme: 'bearer' } } },
            },
            values,
            'schemeName'
          )
        ).toBe(false);
      });
    });
  });

  describe('oauth2 support', () => {
    it('should work for oauth2', () => {
      const apiKey = '123456';

      expect(
        configureSecurity(
          {
            components: { securitySchemes: { schemeName: { type: 'oauth2' } } },
          },
          { schemeName: apiKey },
          'schemeName'
        )
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
            components: { securitySchemes: { schemeName: { type: 'oauth2' } } },
          },
          { schemeName: '' },
          'schemeName'
        )
      ).toBe(false);
    });
  });

  describe('apiKey auth support', () => {
    describe('in `query`', () => {
      it('should work for query', () => {
        const values = { schemeName: 'value' };
        const security = { type: 'apiKey', in: 'query', name: 'key' };

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: security } },
            },
            values,
            'schemeName'
          )
        ).toStrictEqual({
          type: 'queryString',
          value: {
            name: security.name,
            value: values.schemeName,
          },
        });
      });
    });

    describe('in `header`', () => {
      it('should work for header', () => {
        const values = { schemeName: 'value' };
        const security = { type: 'apiKey', in: 'header', name: 'key' };

        expect(
          configureSecurity(
            {
              components: { securitySchemes: { schemeName: security } },
            },
            values,
            'schemeName'
          )
        ).toStrictEqual({
          type: 'headers',
          value: {
            name: security.name,
            value: values.schemeName,
          },
        });
      });

      describe('x-bearer-format', () => {
        it('should work for bearer', () => {
          const values = { schemeName: 'value' };
          const security = {
            type: 'apiKey',
            in: 'header',
            name: 'key',
            'x-bearer-format': 'bearer',
          };

          expect(
            configureSecurity(
              {
                components: { securitySchemes: { schemeName: security } },
              },
              values,
              'schemeName'
            )
          ).toStrictEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Bearer ${values.schemeName}`,
            },
          });
        });

        it('should work for basic', () => {
          const values = { schemeName: 'value' };
          const security = {
            type: 'apiKey',
            in: 'header',
            name: 'key',
            'x-bearer-format': 'basic',
          };

          expect(
            configureSecurity(
              {
                components: { securitySchemes: { schemeName: security } },
              },
              values,
              'schemeName'
            )
          ).toStrictEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Basic ${values.schemeName}`,
            },
          });
        });

        it('should work for token', () => {
          const values = { schemeName: 'value' };
          const security = {
            type: 'apiKey',
            in: 'header',
            name: 'key',
            'x-bearer-format': 'token',
          };

          expect(
            configureSecurity(
              {
                components: { securitySchemes: { schemeName: security } },
              },
              values,
              'schemeName'
            )
          ).toStrictEqual({
            type: 'headers',
            value: {
              name: security.name,
              value: `Token ${values.schemeName}`,
            },
          });
        });
      });
    });
  });
});

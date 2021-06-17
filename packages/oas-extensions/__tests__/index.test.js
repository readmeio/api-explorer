const extensions = require('..');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');
const Oas = require('oas');

test.each([
  ['CODE_SAMPLES'],
  ['EXPLORER_ENABLED'],
  ['HEADERS'],
  ['PROXY_ENABLED'],
  ['SAMPLES_ENABLED'],
  ['SAMPLES_LANGUAGES'],
  ['SEND_DEFAULTS'],
  ['SIMPLE_MODE'],
])('`%s` extension should have a default value', extension => {
  expect(extensions[extension] in extensions.defaults).toBe(true);
});

describe('#getExtension', () => {
  describe('oas-level extensions', () => {
    it('should use the default extension value if the extension is not present', () => {
      const oas = new Oas(petstore);
      expect(extensions.getExtension(extensions.SAMPLES_LANGUAGES, oas)).toStrictEqual([
        'curl',
        'node',
        'ruby',
        'php',
        'python',
      ]);
    });

    it('should locate an extensions under `x-readme`', () => {
      const oas = new Oas({
        ...petstore,
        'x-readme': {
          [extensions.SAMPLES_LANGUAGES]: ['swift'],
        },
      });

      expect(extensions.getExtension(extensions.SAMPLES_LANGUAGES, oas)).toStrictEqual(['swift']);
    });

    it('should locate an extensions listed at the root', () => {
      const oas = new Oas({ ...petstore, [`x-${extensions.EXPLORER_ENABLED}`]: false });
      expect(extensions.getExtension(extensions.EXPLORER_ENABLED, oas)).toBe(false);
    });
  });

  describe('operation-level', () => {
    const oas = new Oas(petstore);

    it('should use the default extension value if the extension is not present', () => {
      const operation = oas.operation('/pet', 'post');

      expect(extensions.getExtension(extensions.SAMPLES_LANGUAGES, oas, operation)).toStrictEqual([
        'curl',
        'node',
        'ruby',
        'php',
        'python',
      ]);
    });

    it('should locate an extensions under `x-readme`', () => {
      const operation = oas.operation('/pet', 'post');
      operation.schema['x-readme'] = {
        [extensions.SAMPLES_LANGUAGES]: ['swift'],
      };

      expect(extensions.getExtension(extensions.SAMPLES_LANGUAGES, oas, operation)).toStrictEqual(['swift']);
    });

    it('should locate an extensions listed at the root', () => {
      const operation = oas.operation('/pet', 'post');
      operation.schema[`x-${extensions.EXPLORER_ENABLED}`] = false;

      expect(extensions.getExtension(extensions.EXPLORER_ENABLED, oas, operation)).toBe(false);
    });
  });
});

describe('#isExtensionValid()', () => {
  it('should validate that `x-readme` is an object', () => {
    expect(() => {
      extensions.validateExtension(extensions.EXPLORER_ENABLED, { 'x-readme': [] });
    }).toThrow(/must be of type "Object"/);

    expect(() => {
      extensions.validateExtension(extensions.EXPLORER_ENABLED, { 'x-readme': false });
    }).toThrow(/must be of type "Object"/);

    expect(() => {
      extensions.validateExtension(extensions.EXPLORER_ENABLED, { 'x-readme': null });
    }).toThrow(/must be of type "Object"/);
  });

  describe.each([
    ['CODE_SAMPLES', [], false, 'Array'],
    ['EXPLORER_ENABLED', true, 'false', 'Boolean'],
    ['HEADERS', [{ key: 'X-API-Key', value: 'abc123' }], false, 'Array'],
    ['PROXY_ENABLED', true, 'yes', 'Boolean'],
    ['SAMPLES_ENABLED', true, 'no', 'Boolean'],
    ['SAMPLES_LANGUAGES', ['swift'], {}, 'Array'],
    ['SEND_DEFAULTS', true, 'absolutely not', 'Boolean'],
    ['SIMPLE_MODE', true, 'absolutely not', 'Boolean'],
  ])('%s', (extension, validValue, invalidValue, expectedType) => {
    describe('should allow valid extensions', () => {
      it('should allow at the root level', () => {
        expect(() => {
          extensions.validateExtension(extensions[extension], { [`x-${extensions[extension]}`]: validValue });
        }).not.toThrow();
      });

      it('should allow if nested in `x-readme`', () => {
        expect(() => {
          extensions.validateExtension(extensions[extension], {
            'x-readme': {
              [extensions[extension]]: validValue,
            },
          });
        }).not.toThrow();
      });
    });

    describe('should fail on invalid extension values', () => {
      it('should error if at the root level', () => {
        expect(() => {
          extensions.validateExtension(extensions[extension], { [`x-${extensions[extension]}`]: invalidValue });
        }).toThrow(new RegExp(`"x-${extensions[extension]}" must be of type "${expectedType}"`));
      });

      it('should error if nested in `x-readme`', () => {
        expect(() => {
          extensions.validateExtension(extensions[extension], {
            'x-readme': {
              [extensions[extension]]: invalidValue,
            },
          });
        }).toThrow(new RegExp(`"x-readme.${extensions[extension]}" must be of type "${expectedType}"`));
      });
    });
  });
});

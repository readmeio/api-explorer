const extensions = require('..');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');
const Oas = require('oas/tooling');

test.each([
  ['CODE_SAMPLES'],
  ['EXPLORER_ENABLED'],
  ['HEADERS'],
  ['PROXY_ENABLED'],
  ['RESPONSE_SAMPLES'],
  ['SAMPLES_ENABLED'],
  ['SAMPLES_LANGUAGES'],
  ['SEND_DEFAULTS'],
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
        'javascript',
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
        'javascript',
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

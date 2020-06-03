const { mount, shallow } = require('enzyme');
const path = require('path');
const glob = require('glob');
const fs = require('fs').promises;

const syntaxHighlighter = require('..');
const uppercase = require('../uppercase');
const canoncial = require('../canonical');

const fixtures = glob.sync(path.join(__dirname, '/__fixtures__/*'));

test('should highlight a block of code', () => {
  const code = shallow(syntaxHighlighter('var a = 1;', 'javascript'));

  expect(code.hasClass('cm-s-neo')).toBe(true);
  expect(code.html()).toBe(
    '<span class="cm-s-neo"><span class="cm-keyword">var</span> <span class="cm-def">a</span> <span class="cm-operator">=</span> <span class="cm-number">1</span>;</span>'
  );
});

test('should work when passed a non-string value', () => {
  expect(() => syntaxHighlighter(false, 'text')).not.toThrow();
});

test('should sanitize plain text language', () => {
  expect(shallow(syntaxHighlighter('& < > " \' /', 'text')).html()).toContain('&amp; &lt; &gt; &quot; &#x27; /');
});

test('should sanitize mode', () => {
  expect(shallow(syntaxHighlighter('&', 'json')).html()).toContain('&amp;');
  expect(shallow(syntaxHighlighter('<', 'json')).html()).toContain('&lt;');
});

test('should concat the same style items', () => {
  // This is testing the `accum += text;` line
  expect(shallow(syntaxHighlighter('====', 'javascript')).text()).toContain('====');
});

test('should work with modes', () => {
  expect(shallow(syntaxHighlighter('{ "a": 1 }', 'json')).html()).toBe(
    '<span class="cm-s-neo">{ <span class="cm-property">&quot;a&quot;</span>: <span class="cm-number">1</span> }</span>'
  );
});

test('should have a dark theme', () => {
  expect(shallow(syntaxHighlighter('{ "a": 1 }', 'json', { dark: true })).hasClass('cm-s-tomorrow-night')).toBe(true);
});

test('should tokenize variables (double quotes)', () => {
  expect(mount(syntaxHighlighter('"<<apiKey>>"', 'json', { tokenizeVariables: true })).find('Variable')).toHaveLength(
    1
  );
});

test('should tokenize variables (single quotes)', () => {
  expect(mount(syntaxHighlighter("'<<apiKey>>'", 'json', { tokenizeVariables: true })).find('Variable')).toHaveLength(
    1
  );
});

test('should keep enclosing characters around the variable', () => {
  expect(mount(syntaxHighlighter("'<<apiKey>>'", 'json', { tokenizeVariables: true })).text()).toBe("'APIKEY'");
});

describe('Supported languages', () => {
  const languages = fixtures.map(fixture => {
    return [uppercase(path.basename(fixture)), fixture];
  });

  describe.each(languages)('%s', (language, fixtureDir) => {
    let testCase;

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const instructions = require(path.join(fixtureDir, 'index.js'));

    beforeEach(async () => {
      testCase = await fs.readFile(path.join(fixtureDir, `sample.${instructions.mode.primary}`), 'utf8');
    });

    it('should have a properly formatted instruction set', () => {
      expect(instructions).not.toBeUndefined();
      expect(instructions).toStrictEqual({
        language: expect.any(String),
        mode: expect.objectContaining({
          primary: expect.any(String),
          aliases: expect.any(Object),
        }),
      });
    });

    it('should syntax highlight an example', () => {
      const highlighted = shallow(syntaxHighlighter(testCase, instructions.mode.primary)).html();
      expect(highlighted).toMatchSnapshot();
    });

    if (Object.keys(instructions.mode.aliases).length > 0) {
      const aliases = Object.keys(instructions.mode.aliases).map(alias => [alias, instructions.mode.aliases[alias]]);

      describe('Mode aliases', () => {
        describe.each(aliases)('%s', (alias, aliasName) => {
          it('should support the mode alias', () => {
            const highlighted = shallow(syntaxHighlighter(testCase, instructions.mode.primary)).html();
            expect(shallow(syntaxHighlighter(testCase, alias)).html()).toBe(highlighted);
          });

          it('should uppercase the mode alias', () => {
            expect(uppercase(alias)).toBe(aliasName);
          });

          it('should have a canonical directive set up', () => {
            // eslint-disable-next-line jest/no-if
            if ('canonical' in instructions.mode) {
              expect(canoncial(alias)).toBe(instructions.mode.canonical);
            } else {
              expect(canoncial(alias)).toBe(instructions.mode.primary);
            }
          });
        });
      });
    }

    if (instructions.mode.primary === 'html') {
      it('should highlight handlebars templates', () => {
        const code = '<p>{{firstname}} {{lastname}}</p>';
        expect(shallow(syntaxHighlighter(code, 'handlebars')).html()).toContain('cm-bracket');
      });
    } else if (instructions.mode.primary === 'php') {
      it('should highlight if missing an opening `<?php` tag', () => {
        expect(shallow(syntaxHighlighter('echo "Hello World";', 'php')).html()).toContain('cm-keyword');
      });
    }
  });
});

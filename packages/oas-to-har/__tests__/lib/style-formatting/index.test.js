const Oas = require('oas/tooling');

const oasToHar = require('../../../src/index');

const oas = new Oas();

const emptyInput = '';
const undefinedInput = undefined;
const stringInput = 'blue';
const arrayInput = ['blue', 'black', 'brown'];
const undefinedArrayInput = [undefined];
const objectInput = { R: 100, G: 200, B: 150 };
const undefinedObjectInput = { R: undefined };

const semicolon = ';'; // %3B when encoded, which we don't want
const equals = '='; // %3D when encoded, which we don't want
const comma = ','; // %2C when encoded, which we don't want

/**
 * These tests ensure that each style matches the spec: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#style-values
 *    and the examples https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#style-examples.
 *
 * Why 3.1.0 when it's not out yet, and we don't support it? Well all the prior documentation is riddled with documentation inconsistencies that appear
 *    to be cleared up in 3.1.0. No new features, just less confusion.
 *
 * Sometimes we also refer to https://swagger.io/docs/specification/serialization for implementation clarification, such as when explode becomes multiple parameters, and when it stays as multiple values in one parameter
 *
 * I have copied the spec and example from the 3.1.0 docs below for easy reference
 *
 * Style Values
 *
 *   In order to support common ways of serializing simple parameters, a set of style values are defined.
 *   style 	          type 	                    in 	            Comments
 *   matrix 	        primitive, array, object 	path 	          Path-style parameters defined by RFC6570
 *   label 	          primitive, array, object 	path 	          Label style parameters defined by RFC6570
 *   form 	          primitive, array, object 	query, cookie 	Form style parameters defined by RFC6570. This option replaces collectionFormat with a csv (when explode is false) or multi (when explode is true) value from OpenAPI 2.0.
 *   simple 	        array 	                  path, header 	  Simple style parameters defined by RFC6570. This option replaces collectionFormat with a csv value from OpenAPI 2.0.
 *   spaceDelimited 	array, object 	          query 	        Space separated array or object values. This option replaces collectionFormat equal to ssv from OpenAPI 2.0.
 *   pipeDelimited 	  array, object 	          query 	        Pipe separated array or object values. This option replaces collectionFormat equal to pipes from OpenAPI 2.0.
 *   deepObject 	    object 	                  query 	        Provides a simple way of rendering nested objects using form parameters.
 *
 *
 *  Style Examples
 *
 *  Assume a parameter named color has one of the following values:
 *
 *     string -> "blue"
 *     array -> ["blue","black","brown"]
 *     object -> { "R": 100, "G": 200, "B": 150 }
 *
 *  The following table shows examples of rendering differences for each value. (NON-SPEC-NOTE: I've added the additional `in` column for easy reference)
 *  style           explode   empty   string        array                                 object                                  in
 *  matrix          false     ;color  ;color=blue   ;color=blue,black,brown               ;color=R,100,G,200,B,150                path
 *  matrix          true      ;color  ;color=blue   ;color=blue;color=black;color=brown   ;R=100;G=200;B=150                      path
 *  label           false     .       .blue         .blue.black.brown                     .R.100.G.200.B.150                      path
 *  label           true      .       .blue         .blue.black.brown                     .R=100.G=200.B=150                      path
 *  form            false     color=  color=blue    color=blue,black,brown                color=R,100,G,200,B,150                 query, cookie
 *  form            true      color=  color=blue    color=blue&color=black&color=brown    R=100&G=200&B=150                       query, cookie
 *  simple          false     n/a     blue          blue,black,brown                      R,100,G,200,B,150                       path, header
 *  simple          true      n/a     blue          blue,black,brown                      R=100,G=200,B=150                       path, header
 *  spaceDelimited  false     n/a     n/a           blue%20black%20brown                  R%20100%20G%20200%20B%20150             query
 *  pipeDelimited   false     n/a     n/a           blue|black|brown                      R|100|G|200|B|150                       query
 *  deepObject      true      n/a     n/a           n/a                                   color[R]=100&color[G]=200&color[B]=150  query
 */

// This should work for matrix(empty, primitive, array, object)*(explode:t/f), label(empty, primitive, array, object)*(explode:t/f), simple(primitive, array, object)*(explode:t/f)
describe('path values', () => {
  describe('matrix path', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'path',
          style: 'matrix',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'path',
          style: 'matrix',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should support matrix path styles non exploded empty input',
        paramNoExplode,
        { path: { color: emptyInput } },
        `https://example.com/style-path/${semicolon}color`,
      ],
      [
        'should support matrix path styles styles for exploded empty input',
        paramExplode,
        { path: { color: emptyInput } },
        `https://example.com/style-path/${semicolon}color`,
      ],
      [
        'should support matrix path styles non exploded undefined input',
        paramNoExplode,
        { path: { color: undefinedInput } },
        `https://example.com/style-path/${semicolon}color`,
      ],
      [
        'should support matrix path styles styles for exploded undefined input',
        paramExplode,
        { path: { color: undefinedInput } },
        `https://example.com/style-path/${semicolon}color`,
      ],
      [
        'should support matrix path styles non exploded undefined array input',
        paramNoExplode,
        { path: { color: undefinedArrayInput } },
        `https://example.com/style-path/${semicolon}color`,
      ],
      [
        'should support matrix path styles styles for exploded undefined array input',
        paramExplode,
        { path: { color: undefinedArrayInput } },
        `https://example.com/style-path/${semicolon}color`,
      ],
      [
        'should support matrix path styles non exploded undefined object input',
        paramNoExplode,
        { path: { color: undefinedObjectInput } },
        `https://example.com/style-path/${semicolon}color${equals}R${comma}`,
      ],
      [
        'should support matrix path styles styles for exploded undefined object input',
        paramExplode,
        { path: { color: undefinedObjectInput } },
        `https://example.com/style-path/${semicolon}R${equals}`,
      ],
      [
        'should support matrix path styles styles for non exploded string input',
        paramNoExplode,
        { path: { color: stringInput } },
        `https://example.com/style-path/${semicolon}color${equals}blue`,
      ],
      [
        'should support matrix path styles styles for exploded string input',
        paramExplode,
        { path: { color: stringInput } },
        `https://example.com/style-path/${semicolon}color${equals}blue`,
      ],
      [
        'should support matrix path styles styles for non exploded array input',
        paramNoExplode,
        { path: { color: arrayInput } },
        `https://example.com/style-path/${semicolon}color${equals}blue${comma}black${comma}brown`,
      ],
      [
        'should support matrix path styles styles for exploded array input',
        paramExplode,
        { path: { color: arrayInput } },
        `https://example.com/style-path/${semicolon}color${equals}blue${semicolon}color${equals}black${semicolon}color${equals}brown`,
      ],
      [
        'should support matrix path styles styles for non exploded object input',
        paramNoExplode,
        { path: { color: objectInput } },
        `https://example.com/style-path/${semicolon}color${equals}R${comma}100${comma}G${comma}200${comma}B${comma}150`,
      ],
      [
        'should support matrix path styles styles for exploded object input',
        paramExplode,
        { path: { color: objectInput } },
        `https://example.com/style-path/${semicolon}R${equals}100${semicolon}G${equals}200${semicolon}B${equals}150`,
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedUrl) => {
      const har = oasToHar(
        oas,
        {
          path: '/style-path/{color}',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.url).toStrictEqual(expectedUrl);
    });
  });

  describe('label path', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'path',
          style: 'label',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'path',
          style: 'label',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should support label path styles non exploded empty input',
        paramNoExplode,
        { path: { color: emptyInput } },
        'https://example.com/style-path/.',
      ],
      [
        'should support label path styles styles for exploded empty input',
        paramExplode,
        { path: { color: emptyInput } },
        'https://example.com/style-path/.',
      ],
      [
        'should support label path styles styles for non exploded string input',
        paramNoExplode,
        { path: { color: stringInput } },
        'https://example.com/style-path/.blue',
      ],
      [
        'should support label path styles styles for exploded string input',
        paramExplode,
        { path: { color: stringInput } },
        'https://example.com/style-path/.blue',
      ],
      [
        'should support label path styles styles for non exploded array input',
        paramNoExplode,
        { path: { color: arrayInput } },
        'https://example.com/style-path/.blue.black.brown',
      ],
      [
        'should support label path styles styles for exploded array input',
        paramExplode,
        { path: { color: arrayInput } },
        'https://example.com/style-path/.blue.black.brown',
      ],
      [
        'should support label path styles styles for non exploded object input',
        paramNoExplode,
        { path: { color: objectInput } },
        'https://example.com/style-path/.R.100.G.200.B.150',
      ],
      [
        'should support label path styles styles for exploded object input',
        paramExplode,
        { path: { color: objectInput } },
        `https://example.com/style-path/.R${equals}100.G${equals}200.B${equals}150`,
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedUrl) => {
      const har = oasToHar(
        oas,
        {
          path: '/style-path/{color}',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.url).toStrictEqual(expectedUrl);
    });
  });

  describe('simple path', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'path',
          style: 'simple',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'path',
          style: 'simple',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should NOT support simple path styles non exploded empty input',
        paramNoExplode,
        { path: { color: emptyInput } },
        'https://example.com/style-path/',
      ],
      [
        'should NOT support simple path styles styles for exploded empty input',
        paramExplode,
        { path: { color: emptyInput } },
        'https://example.com/style-path/',
      ],
      [
        'should support simple path styles styles for non exploded string input',
        paramNoExplode,
        { path: { color: stringInput } },
        'https://example.com/style-path/blue',
      ],
      [
        'should support simple path styles styles for exploded string input',
        paramExplode,
        { path: { color: stringInput } },
        'https://example.com/style-path/blue',
      ],
      [
        'should support simple path styles styles for non exploded array input',
        paramNoExplode,
        { path: { color: arrayInput } },
        `https://example.com/style-path/blue${comma}black${comma}brown`,
      ],
      [
        'should support simple path styles styles for exploded array input',
        paramExplode,
        { path: { color: arrayInput } },
        `https://example.com/style-path/blue${comma}black${comma}brown`,
      ],
      [
        'should support simple path styles styles for non exploded object input',
        paramNoExplode,
        { path: { color: objectInput } },
        `https://example.com/style-path/R${comma}100${comma}G${comma}200${comma}B${comma}150`,
      ],
      [
        'should support simple path styles styles for exploded object input',
        paramExplode,
        { path: { color: objectInput } },
        `https://example.com/style-path/R${equals}100${comma}G${equals}200${comma}B${equals}150`,
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedUrl) => {
      const har = oasToHar(
        oas,
        {
          path: '/style-path/{color}',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.url).toStrictEqual(expectedUrl);
    });
  });
});

// this should test form(empty, primitive, array, object)*(explode:t/f), spaceDelimited(array, object)*(explode:f), pipeDelimited(array, object)*(explode:f), deepObject(object)*(explode:t)
describe('query values', () => {
  describe('form style', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'form',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'form',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should support form delimited query styles for non exploded empty input',
        paramNoExplode,
        { query: { color: emptyInput } },
        [{ name: 'color', value: '' }],
      ],
      [
        'should support form delimited query styles for exploded empty input',
        paramExplode,
        { query: { color: emptyInput } },
        [{ name: 'color', value: '' }],
      ],
      [
        'should support form delimited query styles for non exploded string input',
        paramNoExplode,
        { query: { color: stringInput } },
        [{ name: 'color', value: 'blue' }],
      ],
      [
        'should support form delimited query styles for exploded string input',
        paramExplode,
        { query: { color: stringInput } },
        [{ name: 'color', value: 'blue' }],
      ],
      [
        'should support form delimited query styles for non exploded array input',
        paramNoExplode,
        { query: { color: arrayInput } },
        [{ name: 'color', value: 'blue,black,brown' }],
      ],
      [
        'should support form delimited query styles for exploded array input',
        paramExplode,
        { query: { color: arrayInput } },
        [
          { name: 'color', value: 'blue' },
          { name: 'color', value: 'black' },
          { name: 'color', value: 'brown' },
        ],
      ],
      [
        'should support form delimited query styles for non exploded object input',
        paramNoExplode,
        { query: { color: objectInput } },
        [{ name: 'color', value: 'R,100,G,200,B,150' }],
      ],
      [
        'should support form delimited query styles for exploded object input',
        paramExplode,
        { query: { color: objectInput } },
        [
          { name: 'R', value: '100' },
          { name: 'G', value: '200' },
          { name: 'B', value: '150' },
        ],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedQueryString = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/query',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.queryString).toStrictEqual(expectedQueryString);
    });
  });

  describe('spaceDelimited style', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'spaceDelimited',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'spaceDelimited',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should NOT support space delimited query styles for non exploded empty input',
        paramNoExplode,
        { query: { color: emptyInput } },
        [],
      ],
      [
        'should NOT support space delimited query styles for exploded empty input',
        paramExplode,
        { query: { color: emptyInput } },
        [],
      ],
      [
        'should NOT support space delimited query styles for non exploded string input',
        paramNoExplode,
        { query: { color: stringInput } },
        [],
      ],
      [
        'should NOT support space delimited query styles for exploded string input',
        paramExplode,
        { query: { color: stringInput } },
        [],
      ],
      [
        'should support space delimited query styles for non exploded array input',
        paramNoExplode,
        { query: { color: arrayInput } },
        // Note: this is space here, but %20 in the example above, because encoding happens far down the line
        [{ name: 'color', value: 'blue black brown' }],
      ],
      [
        'should NOT support space delimited query styles for exploded array input',
        paramExplode,
        { query: { color: arrayInput } },
        [],
      ],
      // This is supposed to be supported, but the style-serializer library we use does not have support. Holding off for now.
      /* [
        'should support space delimited query styles for non exploded object input',
        paramNoExplode,
        { query: { color: objectInput } },
        // Note: this is space here, but %20 in the example above, because encoding happens far down the line
        [{ name: 'color', value: 'R 100 G 200 B 150' }],
      ], */
      [
        'should NOT support space delimited query styles for exploded object input',
        paramExplode,
        { query: { color: objectInput } },
        [],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedQueryString = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/query',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.queryString).toStrictEqual(expectedQueryString);
    });
  });

  describe('pipeDelimited style', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'pipeDelimited',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'pipeDelimited',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should NOT support pipe delimited query styles for non exploded empty input',
        paramNoExplode,
        { query: { color: emptyInput } },
        [],
      ],
      [
        'should NOT support pipe delimited query styles for exploded empty input',
        paramExplode,
        { query: { color: emptyInput } },
        [],
      ],
      [
        'should NOT support pipe delimited query styles for non exploded string input',
        paramNoExplode,
        { query: { color: stringInput } },
        [],
      ],
      [
        'should NOT support pipe delimited query styles for exploded string input',
        paramExplode,
        { query: { color: stringInput } },
        [],
      ],
      [
        'should support pipe delimited query styles for non exploded array input',
        paramNoExplode,
        { query: { color: arrayInput } },
        [{ name: 'color', value: 'blue|black|brown' }],
      ],
      [
        'should NOT support pipe delimited query styles for exploded array input',
        paramExplode,
        { query: { color: arrayInput } },
        [],
      ],
      // This is supposed to be supported, but the style-seralizer library we use does not have support. Holding off for now.
      /* [
        'should support pipe delimited query styles for non exploded object input',
        paramNoExplode,
        { query: { color: objectInput } },
        [{ name: 'color', value: 'R|100|G|200|B|150' }],
      ], */
      [
        'should NOT support pipe delimited query styles for exploded object input',
        paramExplode,
        { query: { color: objectInput } },
        [],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedQueryString = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/query',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.queryString).toStrictEqual(expectedQueryString);
    });
  });

  describe('deepObject style', () => {
    const paramNoExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'deepObject',
          explode: false,
        },
      ],
    };

    const paramExplode = {
      parameters: [
        {
          name: 'color',
          in: 'query',
          style: 'deepObject',
          explode: true,
        },
      ],
    };

    it.each([
      [
        'should NOT support deepObject delimited query styles for non exploded empty input',
        paramNoExplode,
        { query: { color: emptyInput } },
        [],
      ],
      [
        'should NOT support deepObject delimited query styles for exploded empty input',
        paramExplode,
        { query: { color: emptyInput } },
        [],
      ],
      [
        'should NOT support deepObject delimited query styles for non exploded string input',
        paramNoExplode,
        { query: { color: stringInput } },
        [],
      ],
      [
        'should NOT support deepObject delimited query styles for exploded string input',
        paramExplode,
        { query: { color: stringInput } },
        [],
      ],
      [
        'should NOT support deepObject delimited query styles for non exploded array input',
        paramNoExplode,
        { query: { color: arrayInput } },
        [],
      ],
      [
        'should NOT support deepObject delimited query styles for exploded array input',
        paramExplode,
        { query: { color: arrayInput } },
        [],
      ],
      [
        'should NOT support deepObject delimited query styles for non exploded object input',
        paramNoExplode,
        { query: { color: objectInput } },
        [],
      ],
      [
        'should support deepObject delimited query styles for exploded object input',
        paramExplode,
        { query: { color: objectInput } },
        [
          { name: 'color[R]', value: '100' },
          { name: 'color[G]', value: '200' },
          { name: 'color[B]', value: '150' },
        ],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedQueryString = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/query',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.queryString).toStrictEqual(expectedQueryString);
    });
  });
});

// This should work for form style, supporting empty, string array and object inputs, with both exploded and non-exploded output
describe('cookie values', () => {
  const paramNoExplode = {
    parameters: [
      {
        name: 'color',
        in: 'cookie',
        style: 'form',
        explode: false,
      },
    ],
  };

  const paramExplode = {
    parameters: [
      {
        name: 'color',
        in: 'cookie',
        style: 'form',
        explode: true,
      },
    ],
  };

  it.each([
    [
      'should support form delimited cookie styles for non exploded empty input',
      paramNoExplode,
      { cookie: { color: emptyInput } },
      [{ name: 'color', value: '' }],
    ],
    [
      'should support form delimited cookie styles for exploded empty input',
      paramExplode,
      { cookie: { color: emptyInput } },
      [{ name: 'color', value: '' }],
    ],
    [
      'should support form delimited cookie styles for non exploded string input',
      {
        parameters: [
          {
            name: 'color',
            in: 'cookie',
            style: 'form',
            explode: false,
          },
        ],
      },
      { cookie: { color: stringInput } },
      [{ name: 'color', value: 'blue' }],
    ],
    [
      'should support form delimited cookie styles for exploded string input',
      paramExplode,
      { cookie: { color: stringInput } },
      [{ name: 'color', value: 'blue' }],
    ],
    [
      'should support form delimited cookie styles for non exploded array input',
      paramNoExplode,
      { cookie: { color: arrayInput } },
      [{ name: 'color', value: 'blue,black,brown' }],
    ],
    [
      'should support form delimited cookie styles for exploded array input',
      paramExplode,
      { cookie: { color: arrayInput } },
      [
        { name: 'color', value: 'blue' },
        { name: 'color', value: 'black' },
        { name: 'color', value: 'brown' },
      ],
    ],
    [
      'should support form delimited cookie styles for non exploded object input',
      paramNoExplode,
      { cookie: { color: objectInput } },
      [{ name: 'color', value: 'R,100,G,200,B,150' }],
    ],
    [
      'should support form delimited cookie styles for exploded object input',
      paramExplode,
      { cookie: { color: objectInput } },
      [
        { name: 'R', value: '100' },
        { name: 'G', value: '200' },
        { name: 'B', value: '150' },
      ],
    ],
  ])('%s', async (testCase, operation = {}, values = {}, expectedCookies = []) => {
    const har = oasToHar(
      oas,
      {
        path: '/',
        method: 'get',
        ...operation,
      },
      values
    );

    await expect(har).toBeAValidHAR();

    expect(har.log.entries[0].request.cookies).toStrictEqual(expectedCookies);
  });
});

// This should work for simple styles on arrays and objects, each with and without exploding. Everything else should return undefined.
describe('header values', () => {
  const paramNoExplode = {
    parameters: [
      {
        name: 'color',
        in: 'header',
        style: 'simple',
        explode: false,
      },
    ],
  };

  const paramExplode = {
    parameters: [
      {
        name: 'color',
        in: 'header',
        style: 'simple',
        explode: true,
      },
    ],
  };

  it.each([
    [
      'should NOT support simple header styles for non exploded empty input',
      paramNoExplode,
      { header: { color: emptyInput } },
      [],
    ],
    [
      'should NOT support simple header styles for exploded empty input',
      paramExplode,
      { header: { color: emptyInput } },
      [],
    ],
    [
      'should support simple header styles for non exploded string input',
      paramNoExplode,
      { header: { color: stringInput } },
      [{ name: 'color', value: 'blue' }],
    ],
    [
      'should support simple header styles for exploded string input',
      paramExplode,
      { header: { color: stringInput } },
      [{ name: 'color', value: 'blue' }],
    ],
    [
      'should support simple header styles for non exploded arrays',
      paramNoExplode,
      { header: { color: arrayInput } },
      [{ name: 'color', value: 'blue,black,brown' }],
    ],
    [
      'should support simple header styles for exploded arrays',
      paramExplode,
      { header: { color: arrayInput } },
      // NOTE: The wording of explode sounds like exploding this object should lead to multiple color headers,
      //  but the examples at https://swagger.io/docs/specification/serialization/#header show a single header
      //  I believe this is because in HTTP (https://tools.ietf.org/html/rfc7230#section-3.2.2), multiple identical headers are represented by a comma separated list in a single header
      [{ name: 'color', value: 'blue,black,brown' }],
    ],
    [
      'should support simple header styles for non exploded objects',
      paramNoExplode,
      { header: { color: objectInput } },
      [{ name: 'color', value: 'R,100,G,200,B,150' }],
    ],
    [
      'should support simple header styles for exploded objects',
      paramExplode,
      { header: { color: objectInput } },
      // NOTE: The wording of explode sounds like exploding this object should lead to an R, G and B header,
      //  but the examples at https://swagger.io/docs/specification/serialization/#header show a single header
      //  I'm not sure why this is the case, since explosion should push these values up one level. I would think that we would end up with R, G and B headers. For some unclear reason we do not.
      [{ name: 'color', value: 'R=100,G=200,B=150' }],
    ],
  ])('%s', async (testCase, operation = {}, values = {}, expectedHeaders = []) => {
    const har = oasToHar(
      oas,
      {
        path: '/header',
        method: 'get',
        ...operation,
      },
      values
    );

    await expect(har).toBeAValidHAR();

    expect(har.log.entries[0].request.headers).toStrictEqual(expectedHeaders);
  });

  // Eventhough `Accept`, `Authorization`, and `Content-Type` headers can be defined as path parameters, they should
  // be completely ignored when it comes to serialization.
  //
  //  > If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition
  //  > SHALL be ignored.
  //
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md#fixed-fields-10
  describe('should ignore styling definitions on OAS-level handled headers', () => {
    it.each([
      ['`accept`', 'accept', 'application/json'],
      ['`content-type`', 'content-type', 'application/json'],
      ['`authorization`', 'authorization', 'scheme d9b23eb/0df'],
    ])('%s', async (testCase, headerName, value) => {
      const har = oasToHar(
        oas,
        {
          path: '/header',
          method: 'get',
          parameters: [
            {
              name: headerName,
              in: 'header',
              style: 'simple',
              explode: false,
            },
          ],
        },
        { header: { [headerName]: value } }
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.headers).toStrictEqual([{ name: headerName, value }]);
    });
  });
});

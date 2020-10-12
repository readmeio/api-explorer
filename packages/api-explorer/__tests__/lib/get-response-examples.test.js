const Oas = require('@readme/oas-tooling');
const getResponseExamples = require('../../src/lib/get-response-examples');

const example = require('../__fixtures__/example-results/oas.json');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');

const oas = new Oas(example);
const oas2 = new Oas(petstore);

function encodeJsonExample(json) {
  return JSON.stringify(json, undefined, 2);
}

describe('#getResponseExamples', () => {
  describe('`example`', () => {
    it('should return codes array if is an example for the operation', () => {
      const operation = oas.operation('/single-media-type-single-example-in-example-prop', 'get');
      expect(getResponseExamples(operation, oas)).toStrictEqual([
        {
          status: '200',
          languages: [
            {
              language: 'application/json',
              code: encodeJsonExample({
                id: 12343354,
                email: 'test@example.com',
                name: 'Test user name',
              }),
              multipleExamples: false,
            },
          ],
        },
      ]);
    });

    it('should not transform a $ref in a singular example', () => {
      const operation = oas.operation('/single-media-type-single-example-in-example-prop-with-ref', 'get');
      expect(getResponseExamples(operation, oas)).toStrictEqual([
        {
          status: '200',
          languages: [
            {
              language: 'application/json',
              code: encodeJsonExample({
                $ref: '#/components/examples/user',
              }),
              multipleExamples: false,
            },
          ],
        },
      ]);
    });
  });

  describe('`examples`', () => {
    it.each([
      ['should return codes array if there are examples for the operation', oas.operation('/results', 'get')],
      [
        // The response for this should be identical to `GET /results`, just the way they're formed in the OAS is
        // different.
        'should return codes array if there are examples for the operation, and one of the examples is a $ref',
        oas.operation('/ref-response-example', 'get'),
      ],
    ])('%s', (testcase, operation) => {
      expect(getResponseExamples(operation, oas)).toStrictEqual([
        {
          languages: [
            {
              code: encodeJsonExample({
                user: {
                  email: 'test@example.com',
                  name: 'Test user name',
                },
              }),
              language: 'application/json',
              multipleExamples: false,
            },
          ],
          status: '200',
        },
        {
          languages: [
            {
              code:
                '<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don\'t forget me this weekend!</body></note>',
              language: 'application/xml',
              multipleExamples: false,
            },
          ],
          status: '400',
        },
        {
          languages: [
            {
              code: encodeJsonExample({
                user: {
                  id: 12343354,
                  email: 'test@example.com',
                  name: 'Test user name',
                },
              }),
              language: 'application/json',
              multipleExamples: false,
            },
          ],
          status: 'default',
        },
      ]);
    });

    it('should not set `multipleExamples` if there is just a single example', () => {
      const operation = oas.operation('/single-media-type-single-example', 'get');

      expect(getResponseExamples(operation, oas)).toStrictEqual([
        {
          languages: [
            {
              code: encodeJsonExample({
                name: 'Fluffy',
                petType: 'Cat',
              }),
              language: 'application/json',
              multipleExamples: false,
            },
          ],
          status: '200',
        },
        {
          languages: [
            {
              code:
                '<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don\'t forget me this weekend!</body></note>',
              language: 'application/xml',
              multipleExamples: false,
            },
          ],
          status: '400',
        },
      ]);
    });

    it('should return multiple nested examples if there are multiple response media types types for the operation', () => {
      const operation = oas.operation('/multi-media-types-multiple-examples', 'get');

      expect(getResponseExamples(operation, oas)).toStrictEqual([
        {
          status: '200',
          languages: [
            {
              language: 'text/plain',
              code: 'OK',
              multipleExamples: false,
            },
            {
              language: 'application/json',
              code: false,
              multipleExamples: [
                {
                  label: 'cat',
                  code: encodeJsonExample({
                    name: 'Fluffy',
                    petType: 'Cat',
                  }),
                },
                {
                  label: 'dog',
                  code: encodeJsonExample({
                    name: 'Puma',
                    petType: 'Dog',
                  }),
                },
              ],
            },
          ],
        },
        {
          status: '400',
          languages: [
            {
              language: 'application/xml',
              code:
                '<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don\'t forget me this weekend!</body></note>',
              multipleExamples: false,
            },
          ],
        },
      ]);
    });
  });

  it('should return early if there are no examples', () => {
    const operation = oas2.operation('/pet/findByStatus', 'get');
    expect(getResponseExamples(operation, oas)).toStrictEqual([]);
  });

  it('should return early if there is an empty example', () => {
    const operation = oas.operation('/emptyexample', 'get');
    expect(getResponseExamples(operation, oas)).toStrictEqual([]);
  });

  it('should return early if there is no response', () => {
    const operation = oas.operation('/nolang', 'get');
    expect(getResponseExamples(operation, oas)).toStrictEqual([]);
  });
});

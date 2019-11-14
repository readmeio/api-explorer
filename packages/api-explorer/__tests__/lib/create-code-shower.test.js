const Oas = require('oas');

const createCodeShower = require('../../src/lib/create-code-shower')('results');
const createCodeShower2 = require('../../src/lib/create-code-shower')('examples');

const example = require('../fixtures/example-results/oas');
const petstore = require('../fixtures/petstore/oas');

const oas = new Oas(example);
const oas2 = new Oas(petstore);

function encodeJsonExample(json) {
  return JSON.stringify(json, undefined, 2);
}

describe('createCodeShower', () => {
  test.each([
    [
      'should return codes array if there are examples for the operation',
      oas.operation('/results', 'get'),
    ],
    [
      // The response for this should be identical to `GET /results`, just the way they're formed in
      // the OAS is different.
      'should return codes array if there are examples for the operation, and one of the examples is a $ref',
      oas.operation('/ref-response-example', 'get'),
    ],
  ])('%s', (testcase, operation) => {
    expect(createCodeShower(operation, oas)).toEqual([
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
    ]);
  });

  it('should not set `multipleExamples` if there is just a single example', () => {
    const operation = oas.operation('/single-media-type-single-example', 'get');

    expect(createCodeShower(operation, oas)).toEqual([
      {
        languages: [
          {
            code: encodeJsonExample({
              summary: 'An example of a cat',
              value: {
                name: 'Fluffy',
                petType: 'Cat',
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
    ]);
  });

  it('should return multiple nested examples if there are multiple response media types types for the operation', () => {
    const operation = oas.operation('/multi-media-types-multiple-examples', 'get');

    expect(createCodeShower(operation, oas)).toEqual([
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
                  summary: 'An example of a cat',
                  value: {
                    name: 'Fluffy',
                    petType: 'Cat',
                  },
                }),
              },
              {
                label: 'dog',
                code: encodeJsonExample({
                  summary: "An example of a dog with a cat's name",
                  value: {
                    name: 'Puma',
                    petType: 'Dog',
                  },
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

  it('should return early if there is no example', () => {
    const operation = oas2.operation('/pet/findByStatus', 'get');
    expect(createCodeShower(operation, oas)).toEqual([]);
  });

  it('should return early if there is no response', () => {
    const operation = oas.operation('/nolang', 'get');
    expect(createCodeShower(operation, oas)).toEqual([]);
  });

  it('should return codes if type is not `results`', () => {
    const operation = oas.operation('/results', 'get');
    expect(createCodeShower2(operation, oas)).toEqual([]);
  });
});

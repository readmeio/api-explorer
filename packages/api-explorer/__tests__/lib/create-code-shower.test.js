const createCodeShower = require('../../src/lib/create-code-shower')('results');
const createCodeShower2 = require('../../src/lib/create-code-shower')('examples');

const Oas = require('../../src/lib/Oas.js');
const example = require('../fixtures/example-results/oas');
const petstore = require('../fixtures/petstore/oas');

const oas = new Oas(example);
const oas2 = new Oas(petstore);

describe('createCodeShower', () => {
  it('should return codes array if there are examples for the operation endpoint', () => {
    const operation = oas.operation('/results', 'get');

    expect(createCodeShower(operation)).toEqual([
      {
        status: '200',
        languages: [
          {
            language: 'application/json',
            code: JSON.stringify(
              {
                user: {
                  email: 'test@example.com',
                  name: 'Test user name',
                },
              },
              undefined,
              2,
            ),
            multipleExamples: false,
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

  it('should return multiple, nested, codes if there are multiple response types for the operation endpoint', () => {
    const operation = oas.operation('/multi-media-types', 'get');

    expect(createCodeShower(operation)).toEqual([
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
            code: '',
            multipleExamples: [
              {
                label: 'cat',
                code: JSON.stringify(
                  {
                    summary: 'An example of a cat',
                    value: {
                      name: 'Fluffy',
                      petType: 'Cat',
                    },
                  },
                  undefined,
                  2,
                ),
              },
              {
                label: 'dog',
                code: JSON.stringify(
                  {
                    summary: "An example of a dog with a cat's name",
                    value: {
                      name: 'Puma',
                      petType: 'Dog',
                    },
                  },
                  undefined,
                  2,
                ),
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

  it('should return multiple examples if there are multiple examples for the operation endpoint', () => {
    const operation = oas.operation('/multi-results', 'get');

    expect(createCodeShower(operation)).toEqual([
      {
        status: '200',
        languages: [
          {
            language: 'application/json',
            code: '',
            multipleExamples: [
              {
                label: 'cat',
                code: JSON.stringify(
                  {
                    summary: 'An example of a cat',
                    value: {
                      name: 'Fluffy',
                      petType: 'Cat',
                    },
                  },
                  undefined,
                  2,
                ),
              },
              {
                label: 'dog',
                code: JSON.stringify(
                  {
                    summary: "An example of a dog with a cat's name",
                    value: {
                      name: 'Puma',
                      petType: 'Dog',
                    },
                  },
                  undefined,
                  2,
                ),
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
    expect(createCodeShower(operation)).toEqual([]);
  });

  it('should return early if there is no response', () => {
    const operation = oas.operation('/nolang', 'get');
    expect(createCodeShower(operation)).toEqual([]);
  });

  it('should return codes if type is not results', () => {
    const operation = oas.operation('/results', 'get');
    expect(createCodeShower2(operation)).toEqual([]);
  });
});

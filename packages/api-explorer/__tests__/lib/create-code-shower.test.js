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
        language: 'application/json',
        status: '200',
      },
      {
        code:
          '<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don\'t forget me this weekend!</body></note>',
        language: 'application/xml',
        status: '400',
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

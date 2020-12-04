const upgradeLegacyResponses = require('../../src/lib/upgrade-legacy-responses');

function encodeJsonExample(json) {
  return JSON.stringify(json, undefined, 2);
}

describe('upgradeLegacyResponses', () => {
  it('should not return anything for an legacy response that hasnt been fully configured', () => {
    expect(upgradeLegacyResponses([{ language: 'text', code: '' }])).toStrictEqual([]);
  });

  it('should return codes array for a legacy response shape', () => {
    const encodedExample = {
      meta: {
        status_code: 200,
        status: 'OK',
      },
      data: [],
    };

    const response = [
      {
        code: encodedExample,
        language: 'json',
        name: '',
        status: 200,
      },
    ];

    expect(upgradeLegacyResponses(response)).toStrictEqual([
      {
        languages: [
          {
            code: encodedExample,
            language: 'json',
            multipleExamples: false,
          },
        ],
        status: 200,
      },
    ]);
  });

  it('should return codes array for the XX status codes', () => {
    const encodedExample = {
      meta: {
        status_code: '4XX',
        status: 'OK',
      },
      data: [],
    };

    const response = [
      {
        code: encodedExample,
        language: 'json',
        name: '',
        status: '4XX',
      },
    ];

    expect(upgradeLegacyResponses(response)).toStrictEqual([
      {
        languages: [
          {
            code: encodedExample,
            language: 'json',
            multipleExamples: false,
          },
        ],
        status: '4XX',
      },
    ]);
  });

  it('should return codes array for legacy response shape that has multiple examples', () => {
    const response = [
      {
        code: encodeJsonExample({
          meta: {
            status_code: 200,
            status: 'OK',
          },
          data: [],
        }),
        language: 'json',
        name: 'OK',
        status: 200,
      },
      {
        code: encodeJsonExample({
          meta: {
            status_code: 200,
            status: 'ALL OK',
          },
          data: [],
        }),
        language: 'json',
        name: '',
        status: 200,
      },
    ];

    expect(upgradeLegacyResponses(response)).toStrictEqual([
      {
        languages: [
          {
            code: false,
            language: 'json',
            multipleExamples: [
              {
                label: 'OK',
                code: encodeJsonExample({
                  meta: {
                    status_code: 200,
                    status: 'OK',
                  },
                  data: [],
                }),
              },
              {
                label: 'json',
                code: encodeJsonExample({
                  meta: {
                    status_code: 200,
                    status: 'ALL OK',
                  },
                  data: [],
                }),
              },
            ],
          },
        ],
        status: 200,
      },
    ]);
  });
});

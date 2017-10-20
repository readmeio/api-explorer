const React = require('react');
const { shallow } = require('enzyme');

const Response = require('../src/Response');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;

const props = {
  operation: {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                properties: {
                  category: {
                    properties: {
                      id: { type: 'integer', format: 'int64' },
                      name: { type: 'string' },
                    },
                    type: 'object',
                    xml: { name: 'Pet' },
                  },

                  id: { type: 'integer', format: 'int64' },
                  name: { type: 'string', example: 'doggie' },
                  photoUrls: {
                    type: ' array',
                    items: { type: 'string' },
                    xml: { name: 'photoUrl', wrapped: true },
                  },
                  status: {
                    type: 'string',
                    description: 'pet status in the store',
                    enum: ['available', 'pending', 'sold'],
                  },
                  tags: {
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', format: 'int64' },
                        name: { type: 'string' },
                      },
                      xml: { name: 'Tag' },
                    },
                    type: 'array',
                    xml: { name: 'tag', wrapped: true },
                  },
                },
                required: ['name', 'photoUrls'],
              },
            },
          },
          'application/xml': {
            schema: {
              items: {
                properties: {
                  category: {
                    properties: {
                      id: { type: 'integer', format: 'int64' },
                      name: { type: 'string' },
                    },
                    type: 'object',
                    xml: { name: 'Category' },
                  },

                  id: { type: 'integer', format: 'int64' },
                  name: { type: 'string', example: 'doggie' },
                  photoUrls: {
                    type: ' array',
                    items: { type: 'string' },
                    xml: { name: 'photoUrl', wrapped: true },
                  },
                  status: {
                    type: 'string',
                    description: 'pet status in the store',
                    enum: ['available', 'pending', 'sold'],
                  },
                  tags: {
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', format: 'int64' },
                        name: { type: 'string' },
                      },
                      xml: { name: 'Tag' },
                    },
                    type: 'array',
                    xml: { name: 'tag', wrapped: true },
                  },
                },
                required: ['name', 'photoUrls'],
              },
            },
          },
        },
        description: 'successful operation',
      },
      '400': { description: 'Invalid status value' },
    },
  },
  // new Operation({}, '/pet/findByStatus', 'get'),
};

describe('selectedStatus', () => {
  test('selectedStatus should change state of selectedStatus', () => {
    const response = shallow(<Response {...props} />);

    expect(response.state('selectedStatus')).toBe('200');

    response.instance().selectedStatus('400');

    expect(response.state('selectedStatus')).toBe('400');
  });
});

describe('Response', () => {
  test('should display Response schema', () => {
    const response = shallow(<Response {...props} />);

    expect(response.find('p.desc').length).toBe(1);
  });
});

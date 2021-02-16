import { createFormComponent } from './test_utils';

describe('allOf', () => {
  it('should render a regular input element with a single type, when multiple types specified', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          allOf: [{ type: ['string', 'number', 'null'] }, { type: 'string' }],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll('input')).toHaveLength(1);
  });

  it('should be able to handle incompatible types and not crash', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          allOf: [{ type: 'string' }, { type: 'boolean' }],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll('input')).toHaveLength(0);
  });
});

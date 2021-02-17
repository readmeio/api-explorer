import { createFormComponent } from './test_utils';

describe('const', () => {
  it('should render a schema that uses const with a string value', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { const: 'bar' },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelector('input#root_foo')).not.toBeNull();
  });

  it('should render a schema that uses const with a number value', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { const: 123 },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelector('input#root_foo')).not.toBeNull();
  });

  it('should render a schema that uses const with a boolean value', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { const: true },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelector("input#root_foo[type='checkbox']")).not.toBeNull();
  });
});

import { isValid } from '../src/validate';

describe('Validation', () => {
  describe('validate.isValid()', () => {
    it('should return true if the data is valid against the schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };

      expect(isValid(schema, { foo: 'bar' })).toBe(true);
    });

    it('should return false if the data is not valid against the schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      };

      expect(isValid(schema, { foo: 12345 })).toBe(false);
    });

    it('should return false if the schema is invalid', () => {
      const schema = 'foobarbaz';

      expect(isValid(schema, { foo: 'bar' })).toBe(false);
    });
  });
});

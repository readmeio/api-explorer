import getSchemaToRender from '../../src/JsonForm/getSchemaToRender'

describe('getSchemaToRender', () => {
  it('set empty title', () => {
    const schema = {
      type: 'object',
      properties: {}
    }
    expect(getSchemaToRender(schema)).toEqual({
      type: 'object',
      properties: {},
      title: " "
    })
  })
  it('if has no ref in root, returns as is', () => {
    const schema = {
      type: 'object',
      properties: {}
    }
    expect(getSchemaToRender(schema)).toEqual({
      type: 'object',
      properties: {},
      title: " "
    })
  })
  it('if has ref in root, resolves it', () => {
    const schema = {
      $ref: "#/components/Pet",
      definitions: {
        components: {
          Pet: {
            type: 'object',
            properties: {
              foo: { type: 'string' }
            }
          }
        }
      }
    }
    expect(getSchemaToRender(schema)).toEqual({
      title: " ",
      type: 'object',
      properties: {
        foo: { type: 'string' }
      },
      definitions: {
        components: {
          Pet: {
            type: 'object',
            properties: {
              foo: { type: 'string' }
            }
          }
        }
      }
    })
  })
})
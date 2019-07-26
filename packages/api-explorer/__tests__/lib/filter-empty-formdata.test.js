import filterEmptyFormData from '../../src/lib/filter-empty-formdata'

describe('filterEmptyFormData', () => {
  it('filters all empty objects or objects with all undefined', () => {
    const input = {
      body: {
        $set: {
          position: [123, 456],
          "image.$.replace": {
            key: undefined,
          },
          "image.$.merge": {}
        },
        $unset: {
          anotherKey: undefined
        },
        $inc: {},
        $mul: {},
        $currentDate: {},
        $push: {
          image: {}
        }
      }
    }
    const result = filterEmptyFormData(input)
    expect(result).toEqual({
      body: {
        $set: { position: [123, 456] },
      }
    })
  })

  it('filters objects with all null values', () => {
    const input = {
      body: {
        $set: {
          position: [123, 456],
          "image.$.replace": {
            key: null,
          },
          "image.$.merge": {}
        },
        $unset: {
          anotherKey: null
        },
        $inc: {},
        $mul: {},
        $currentDate: {},
        $push: {
          image: {}
        }
      }
    }
    const result = filterEmptyFormData(input)
    expect(result).toEqual({
      body: {
        $set: { position: [123, 456] },
      }
    })
  })
  
  it('filters objects into arrays', () => {
    const input = {
      "body": [{
        "filter": {
          "_st": "PUBLIC"
        },
        "update": {
          "$set": {
            "image.$.replace": {},
            "image.$.merge": {}
          },
          "$unset": {},
          "$inc": {},
          "$mul": {},
          "$currentDate": {},
          "$push": {
            "image": {}
          }
        }
      }]
    } 
    const result = filterEmptyFormData(input)
    expect(result).toEqual({
      body: [{
       filter: {_st: 'PUBLIC'} 
      }]
    })
  })
  
  it('keeps unchanged arrays with null content', () => {
    const input = { body: { someArray: [null, null], __STATE__: 'DRAFT'}}
    const result = filterEmptyFormData(input)
    expect(result).toEqual({
      body: {
        someArray: [null, null],
        __STATE__: 'DRAFT'
      },
    })
  })
  
  it('does not filter booleans', () => {
    const input = {
      body: [{
        filter: {
          _st: 'PUBLIC',
          _id:'ff',
          creatorId: 'a',
          createdAt: 'b'
        },
        update: {
          $set: {
            name:'ff',
            location:'89'
          },
          $unset: {
            name: true
          }
        }
      }]
    }
    const result = filterEmptyFormData(input)
    expect(result).toEqual(input)
  })

  it('does not filter numbers', () => {
    const input = {
      body: [{
        filter: {
          _st: 'PUBLIC',
          _id:'ff',
          creatorId: 'a',
          createdAt: 'b'
        },
        update: {
          $set: {
            name:'ff',
            location:'89'
          },
          $unset: {
            size: 123
          }
        }
      }]
    }
    const result = filterEmptyFormData(input)
    expect(result).toEqual(input)
  })

  it('does not filter empty strings', () => {
    const input = {
      body: [{
        filter: {
          _st: 'PUBLIC',
          _id:'ff',
          creatorId: 'a',
          createdAt: 'b'
        },
        update: {
          $set: {
            name:'',
            location:''
          },
          $unset: {
            size: 123
          }
        }
      }]
    }
    const result = filterEmptyFormData(input)
    expect(result).toEqual(input)
  })
})

describe('filterEmptyFormData with schema', () => {
  it('should not filter required top-level object properties', () => {
    const schema = {
      type: 'object',
      required: ['b'],
      properties: {
        a: { type: 'boolean'},
        b: { type: 'object'},
      },
    }
    const input = {
      body: {
        a: true,
        b: {}
      }
    }
    const result = filterEmptyFormData(input, schema)
    expect(result).toEqual({
      body: {
        a: true,
        b: {},
      }
    })
  })

  it('should not filter required nested object properties', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'boolean'},
        b: { 
          type: 'object',
          properties: {
            c: {type: 'float'},
            d: {
              type: 'object',
              additionalProperties: true,
            },
          },
          required: ['c', 'd']
        },
      },
    }
    const input = {
      body: {
        a: true,
        b: {
          d: {
            xxx: undefined,
          },
        },
      },
    }
    const result = filterEmptyFormData(input, schema)
    expect(result).toEqual({
      body: {
        a: true,
        b: {
          d: {}
        },
      }
    })
  })

  it('should not filter required array properties', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'boolean'},
        b: { 
          type: 'array',
          required: ['c', 'd'],
          items: {
            c: {type: 'float'},
            d: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    }
    const input = {
      body: {
        a: true,
        b: [
          {
            c: 123,
            d: {
              xxx: undefined,
            },
          }
        ]
      },
    }
    const result = filterEmptyFormData(input, schema)
    expect(result).toEqual({
      body: {
        a: true,
        b:[
          { 
            c: 123,
            d: {},
          }
        ],
      }
    })
  })
})

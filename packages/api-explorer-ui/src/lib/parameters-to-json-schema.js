const getSchema = require('./get-schema');

// https://github.com/OAI/OpenAPI-Specification/blob/4875e02d97048d030de3060185471b9f9443296c/versions/3.0.md#parameterObject
const types = {
  path: 'Path Params',
  query: 'Query Params',
  body: 'Body Params',
  cookie: 'Cookie Params',
  formData: 'Form Data',
  header: 'Headers',
};

function combineParameters(prev, current) {
  prev[current.in] = prev[current.in] || {
    type: 'object',
    description: types[current.in],
    properties: {},
    required: [],
  };

  const schema = {
    type: 'string',
    description: current.description || null,
  };

  if (current.schema) {
    if (current.schema.type === 'array') {
      schema.type = 'array';
      schema.items = current.schema.items;
    }
  }

  prev[current.in].properties = {
    [current.name]: schema,
  };

  if (current.required) {
    prev[current.in].required.push(current.name);
  }

  return prev;
}

module.exports = (pathOperation, oas) => {
  const hasRequestBody = !!pathOperation.requestBody;
  const hasParameters = !!(pathOperation.parameters && pathOperation.parameters.length !== 0);

  if (!hasParameters && !hasRequestBody) return null;

  function getBodyParam() {
    const schema = getSchema(pathOperation);

    if (!schema) return null;

    return {
      type: 'body',
      label: types.body,
      schema,
    };
  }

  function getOtherParams() {
    return Object.keys(types).map(type => {
      const required = [];
      const parameters = pathOperation.parameters.filter(param => param.in === type);
      if (parameters.length === 0) return null;

      const properties = parameters.reduce((prev, current) => {
        const schema = {
          type: 'string',
          description: current.description || null,
        };

        if (current.schema) {
          if (current.schema.type === 'array') {
            schema.type = 'array';
            schema.items = current.schema.items;
          }
        }

        prev[current.name] = schema;

        if (current.required) {
          required.push(current.name);
        }

        return prev;
      }, {});

      return {
        type,
        label: types[type],
        schema: {
          type: 'object',
          properties,
          required,
        },
      };
    })
  }

  return [getBodyParam()].concat(...getOtherParams()).filter(Boolean);
};

// Exported for use in oas-to-har for default values object
module.exports.types = types;

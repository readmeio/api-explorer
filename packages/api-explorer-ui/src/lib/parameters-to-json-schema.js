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

function getBodyParam(pathOperation) {
  const schema = getSchema(pathOperation);

  if (!schema) return null;

  const type = schema.type === 'application/x-www-form-urlencoded' ? 'formData' : 'body';

  return {
    type,
    label: types[type],
    schema: schema.schema,
  };
}

function getOtherParams(pathOperation) {
  return Object.keys(types).map(type => {
    const required = [];
    const parameters = (pathOperation.parameters || []).filter(param => param.in === type);
    if (parameters.length === 0) return null;

    const properties = parameters.reduce((prev, current) => {
      const schema = { type: 'string' };

      if (current.description) schema.description = current.description;

      if (current.schema) {
        if (current.schema.type === 'array') {
          schema.type = 'array';
          schema.items = current.schema.items;
        }

        if (current.schema.default) schema.default = current.schema.default;
        if (current.schema.enum) schema.enum = current.schema.enum;
        if (current.schema.type) schema.type = current.schema.type;
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
  });
}

module.exports = pathOperation => {
  const hasRequestBody = !!pathOperation.requestBody;
  const hasParameters = !!(pathOperation.parameters && pathOperation.parameters.length !== 0);

  if (!hasParameters && !hasRequestBody) return null;

  return [getBodyParam(pathOperation)].concat(...getOtherParams(pathOperation)).filter(Boolean);
};

// Exported for use in oas-to-har for default values object
module.exports.types = types;

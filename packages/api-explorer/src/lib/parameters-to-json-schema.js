const getSchema = require('./get-schema');
const findSchemaDefinition = require('./find-schema-definition');

// https://github.com/OAI/OpenAPI-Specification/blob/4875e02d97048d030de3060185471b9f9443296c/versions/3.0.md#parameterObject
const types = {
  path: 'Path Params',
  query: 'Query Params',
  body: 'Body Params',
  cookie: 'Cookie Params',
  formData: 'Form Data',
  header: 'Headers',
};

function getBodyParam(pathOperation, oas) {
  const schema = getSchema(pathOperation, oas);

  if (!schema) return null;

  let type = 'body'
  switch(schema.type) {
    case 'application/x-www-form-urlencoded':
    case 'multipart/form-data':
      type = 'formData'
      break
    default:
  }

  return {
    type,
    label: types[type],
    schema: oas.components
    ? { components: oas.components , ...schema.schema }
      : schema.schema,
  };
}

function getOtherParams(pathOperation, oas) {
  const resolvedParameters = (pathOperation.parameters || []).map(param => {
    if (param.$ref) return findSchemaDefinition(param.$ref, oas);
    return param;
  });

  return Object.keys(types).map(type => {
    const required = [];

    const parameters = resolvedParameters.filter(param => param.in === type);
    if (parameters.length === 0) return null;

    const properties = parameters.reduce((prev, current) => {
      const schema = {type: 'string'};

      if (current.description) schema.description = current.description;

      if (current.schema) {
        if (current.schema.type === 'array') {
          schema.type = 'array';
          schema.items = current.schema.items;
        }
        if (typeof current.schema.default !== 'undefined') schema.default = current.schema.default;
        if (current.schema.enum) schema.enum = current.schema.enum;
        if (current.schema.type) schema.type = current.schema.type;
        if (current.schema.format) schema.format = current.schema.format;
        if (current.schema.pattern) schema.pattern = current.schema.pattern;
        if (current.schema.minimum) schema.minimum = current.schema.minimum;
        if (current.schema.maximum) schema.maximum = current.schema.maximum;
        if (current.examples) schema.examples = current.examples;
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

module.exports = (pathOperation, oas) => {
  const hasRequestBody = !!pathOperation.requestBody;
  const hasParameters = !!(pathOperation.parameters && pathOperation.parameters.length !== 0);

  if (!hasParameters && !hasRequestBody) return null;

  return [getBodyParam(pathOperation, oas)]
    .concat(...getOtherParams(pathOperation, oas))
    .filter(Boolean);
};

// Exported for use in oas-to-har for default values object
module.exports.types = types;

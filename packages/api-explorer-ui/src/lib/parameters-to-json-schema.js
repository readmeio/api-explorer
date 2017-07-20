module.exports = (pathOperation, oas) => {
  const types = {
    path: 'Path Params',
    query: 'Query Params',
    body: 'Body Params',
    formData: 'Form Data',
    header: 'Headers',
  };

  function getBodyParam() {
    let schema;
    try {
      schema = pathOperation.requestBody.content['application/json'].schema;
    } catch (e) {}

    if (!schema) return {};

    if (schema.$ref) {
      const split = schema.$ref.split('/');
      split.splice(1, 0, 'definitions');
      schema.$ref = split.join('/');
    }

    return { body: Object.assign({ description: types.body }, schema) };
  }

  return {
    type: 'object',
    definitions: { components: { schemas: oas.components.schemas } },
    properties: Object.assign(getBodyParam(), (pathOperation.parameters || []).reduce((prev, current) => {
      prev[current.in] = prev[current.in] || {
        type: 'object',
        description: types[current.in],
        properties: {},
        required: [],
      };

      const schema = {
        type: 'string',
        description: current.description,
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
    }, {})),
  };
};

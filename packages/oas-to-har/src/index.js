const querystring = require('querystring');
const extensions = require('@readme/oas-extensions');
const { findSchemaDefinition, getSchema, parametersToJsonSchema } = require('@readme/oas-tooling/utils');
const { Operation } = require('@readme/oas-tooling');

const configureSecurity = require('./lib/configure-security');
const removeUndefinedObjects = require('./lib/remove-undefined-objects');

function formatter(values, param, type, onlyIfExists) {
  if (typeof values[type][param.name] !== 'undefined') {
    return values[type][param.name];
  }

  if (onlyIfExists && !param.required) {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  }

  if (param.required && param.example) {
    return param.example;
  }

  return param.name;
}

const defaultFormDataTypes = Object.keys(parametersToJsonSchema.types).reduce((prev, curr) => {
  return Object.assign(prev, { [curr]: {} });
}, {});

function getResponseContentType(content) {
  const types = Object.keys(content) || [];

  let type = 'application/json';
  if (types && types.length) {
    type = types[0];
  }

  return type;
}

function isPrimitive(val) {
  return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
}

module.exports = (
  oas,
  operationSchema = { path: '', method: '' },
  values = {},
  auth = {},
  opts = { proxyUrl: false }
) => {
  let operation = operationSchema;
  if (!(operationSchema instanceof Operation)) {
    operation = new Operation(oas, operationSchema.path, operationSchema.method, operationSchema);
  }

  const formData = { ...defaultFormDataTypes, ...values };
  const har = {
    headers: [],
    queryString: [],
    postData: {},
    method: operation.method.toUpperCase(),
    url: `${oas.url()}${operation.path}`.replace(/\s/g, '%20'),
  };

  // TODO look to move this to Oas class as well
  if (oas[extensions.PROXY_ENABLED] && opts.proxyUrl) {
    har.url = `https://try.readme.io/${har.url}`;
  }

  // Does this operation have any parameters?
  const parameters = [];
  function addParameter(param) {
    if (param.$ref) {
      parameters.push(findSchemaDefinition(param.$ref, oas));
    } else {
      parameters.push(param);
    }
  }

  if (operation.parameters) {
    operation.parameters.forEach(addParameter);
  }

  // Does this operation have any common parameters?
  if (oas.paths && oas.paths[operation.path] && oas.paths[operation.path].parameters) {
    oas.paths[operation.path].parameters.forEach(addParameter);
  }

  har.url = har.url.replace(/{([-_a-zA-Z0-9[\]]+)}/g, (full, key) => {
    if (!operation || !parameters) return key; // No path params at all

    // Find the path parameter or set a default value if it does not exist
    const parameter = parameters.find(param => param.name === key) || { name: key };

    return encodeURIComponent(formatter(formData, parameter, 'path'));
  });

  const queryStrings = parameters && parameters.filter(param => param.in === 'query');
  if (queryStrings && queryStrings.length) {
    queryStrings.forEach(queryString => {
      const value = formatter(formData, queryString, 'query', true);
      if (typeof value === 'undefined') return;

      har.queryString.push({
        name: queryString.name,
        value: String(value),
      });
    });
  }

  // Does this response have any documented content types?
  if (operation.responses) {
    Object.keys(operation.responses).some(response => {
      if (!operation.responses[response].content) return false;

      // if there is an Accept header specified in the form, we'll use that instead.
      if (formData.header.Accept) return true;

      har.headers.push({
        name: 'Accept',
        value: getResponseContentType(operation.responses[response].content),
      });

      return true;
    });
  }

  // Do we have any `header` parameters on the operation?
  let hasContentType = false;
  const headers = parameters && parameters.filter(param => param.in === 'header');
  if (headers && headers.length) {
    headers.forEach(header => {
      const value = formatter(formData, header, 'header', true);
      if (typeof value === 'undefined') return;

      if (header.name.toLowerCase() === 'content-type') {
        hasContentType = true;
      }

      har.headers.push({
        name: header.name,
        value: String(value),
      });
    });
  }

  // Are there `x-static` static headers configured for this OAS?
  if (oas[extensions.HEADERS]) {
    oas[extensions.HEADERS].forEach(header => {
      if (header.key.toLowerCase() === 'content-type') {
        hasContentType = true;
      }

      har.headers.push({
        name: header.key,
        value: String(header.value),
      });
    });
  }

  // Do we have an `Accept` header set up in the form, but it hasn't been added yet?
  if (formData.header && formData.header.Accept && har.headers.find(hdr => hdr.name === 'Accept') === undefined) {
    har.headers.push({
      name: 'Accept',
      value: String(formData.header.Accept),
    });
  }

  const schema = getSchema(operation, oas) || { schema: {} };

  function stringify(json) {
    // Default to JSON.stringify
    return JSON.stringify(removeUndefinedObjects(typeof json.RAW_BODY !== 'undefined' ? json.RAW_BODY : json));
  }

  if (schema.schema && Object.keys(schema.schema).length) {
    // If there is formData, then the type is application/x-www-form-urlencoded
    if (Object.keys(formData.formData).length) {
      har.postData.text = querystring.stringify(formData.formData);
      // formData.body can be one of the following:
      // - `undefined` - if the form hasn't been touched yet because of formData.body on:
      // https://github.com/readmeio/api-explorer/blob/b32a2146737c11813bd1b222a137de61854414b3/packages/api-explorer/src/Doc.jsx#L28
      // - a primitive type
      // - an object
    } else if (
      typeof formData.body !== 'undefined' &&
      (isPrimitive(formData.body) || Object.keys(formData.body).length)
    ) {
      try {
        // Find all `{ type: string, format: json }` properties in the schema
        // because we need to manually JSON.parse them before submit, otherwise
        // they'll be escaped instead of actual objects
        const jsonTypes = Object.keys(schema.schema.properties).filter(
          key => schema.schema.properties[key].format === 'json'
        );

        if (jsonTypes.length) {
          // We have to clone the body object, otherwise the form
          // will attempt to re-render with an object, which will
          // cause it to error!
          let cloned = removeUndefinedObjects(JSON.parse(JSON.stringify(formData.body)));
          jsonTypes.forEach(prop => {
            // Attempt to JSON parse each of the json properties
            // if this errors, it'll just get caught and stringify it normally
            cloned[prop] = JSON.parse(cloned[prop]);
          });

          if (typeof cloned.RAW_BODY !== 'undefined') {
            cloned = cloned.RAW_BODY;
          }

          har.postData.text = JSON.stringify(cloned);
        } else {
          har.postData.text = stringify(formData.body);
        }
      } catch (e) {
        // If anything goes wrong in the above, assume that it's invalid JSON
        // and stringify it
        har.postData.text = stringify(formData.body);
      }
    }
  }

  // Add a `Content-Type` header if there are any body values setup above or if there is a schema defined, but only do
  // so if we don't already have a `Content-Type` present as it's impossible for a request to have multiple.
  if ((har.postData.text || Object.keys(schema.schema).length) && !hasContentType) {
    const type = operation.getContentType();

    har.headers.push({
      name: 'Content-Type',
      value: type,
    });
  }

  const securityRequirements = operation.security || oas.security;

  if (securityRequirements && securityRequirements.length) {
    // TODO pass these values through the formatter?
    securityRequirements.forEach(schemes => {
      Object.keys(schemes).forEach(security => {
        const securityValue = configureSecurity(oas, auth, security);
        if (!securityValue) {
          return;
        }

        har[securityValue.type].push(securityValue.value);
      });
    });
  }

  return { log: { entries: [{ request: har }] } };
};

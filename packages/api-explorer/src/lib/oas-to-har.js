import generateFormData from './generateFormData'

const querystring = require('querystring');

const getSchema = require('./get-schema');
const configureSecurity = require('./configure-security');
const removeUndefinedObjects = require('./remove-undefined-objects');
const findSchemaDefinition = require('./find-schema-definition');
const getContentTypeFromOperation = require('./get-content-type')

// const format = {
//   value: v => `__START_VALUE__${v}__END__`,
//   default: v => `__START_DEFAULT__${v}__END__`,
//   key: v => `__START_KEY__${v}__END__`,
// };

const format = {
  value: v => v,
  example: v => v,
  key: v => v,
};

function formatter(values, param, type, onlyIfExists) {
  if (typeof values[type][param.name] !== 'undefined') {
    return format.value(values[type][param.name]);
  }
  if (onlyIfExists && !param.required) {
    return undefined;
  }
  if (param.required && param.example) {
    return format.example(param.example);
  }
  return format.key(param.name);
}

const defaultValues = Object.keys(
  require('./parameters-to-json-schema').types,
).reduce((prev, curr) => {
  return Object.assign(prev, { [curr]: {} });
}, {});

// If you pass in types, it either uses a default, or favors
// anything JSON.
function getContentType(pathOperation) {
  const types = getContentTypeFromOperation(pathOperation)
  let type = 'application/json';
  if (types && types.length) {
    type = types[0];
  }

  // Favor JSON if it exists
  types.forEach(t => {
    if (t.match(/json/)) {
      type = t;
    }
  });
  return type;
}

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
  pathOperation = { path: '', method: '' },
  values = {},
  auth = {},
  opts = { proxyUrl: false },
  contentType
) => {
  const formData = Object.assign({}, defaultValues, values);
  const har = {
    headers: [],
    queryString: [],
    postData: {},
    method: pathOperation.method.toUpperCase(),
    url: `${oas.url()}${pathOperation.path}`.replace(/\s/g, '%20'),
  };

  if (pathOperation.parameters) {
    pathOperation.parameters.forEach((param, i, params) => {
      if (param.$ref) {
        params[i] = findSchemaDefinition(param.$ref, oas);
      }
    });
  }

  har.url = har.url.replace(/{([-_a-zA-Z0-9[\]]+)}/g, (full, key) => {
    if (!pathOperation || !pathOperation.parameters) return key; // No path params at all
    // Find the path parameter or set a default value if it does not exist
    const parameter = pathOperation.parameters.find(param => param.name === key) || { name: key };

    return encodeURIComponent(formatter(formData, parameter, 'path'));
  });

  const queryStrings =
    pathOperation &&
    pathOperation.parameters &&
    pathOperation.parameters.filter(param => param.in === 'query');

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

  const headers =
    pathOperation &&
    pathOperation.parameters &&
    pathOperation.parameters.filter(param => param.in === 'header');

  if (pathOperation.responses) {
    Object.keys(pathOperation.responses).some(response => {
      if (!pathOperation.responses[response].content) return false;

      // if there is an Accept header specified in the form, we'll use that instead.
      if (formData.header.Accept) return true;

      har.headers.push({
        name: 'Accept',
        value: getResponseContentType(pathOperation.responses[response].content),
      });
      return true;
    });
  }

  if (headers && headers.length) {
    headers.forEach(header => {
      const value = formatter(formData, header, 'header', true);
      if (typeof value === 'undefined') return;
      har.headers.push({
        name: header.name,
        value: String(value),
      });
    });
  }

  // x-headers static headers
  if (oas['x-headers']) {
    oas['x-headers'].forEach(header => {
      har.headers.push({
        name: header.key,
        value: String(header.value),
      });
    });
  }

  const schema = getSchema(pathOperation, oas) || { schema: {} };

  function stringify(json) {
    // Default to JSON.stringify
    har.postData.text = JSON.stringify(
      removeUndefinedObjects(typeof json.RAW_BODY !== 'undefined' ? json.RAW_BODY : json),
    );
  }

  if (schema.schema && Object.keys(schema.schema).length) {
    // If there is formData, then the type can be application/x-www-form-urlencoded or
    // multipart/form-data. For the latter we're still going to generate the har information
    // used in the code snippet but the actual request will be generated in another lib file.
    if (Object.keys(formData.formData).length) {
      if (contentType === 'multipart/form-data') {
        const data = generateFormData(formData.formData, {isMultipart: true})
        const multipartData = data.generate()
        har.postData.text = multipartData.body

        // WARNING! I'm updating the provided contentType argument, this is bad practice
        // but as of now it's the only way to push forward the updated Content-Type value
        // featuring the boundary. 
        contentType = multipartData.headers['Content-Type'] // eslint-disable-line
      } else {
        har.postData.text = querystring.stringify(formData.formData);
      }
    } else if (isPrimitive(formData.body) || Object.keys(formData.body).length) {
      try {
        // Find all `{ type: string, format: json }` properties in the schema
        // because we need to manually JSON.parse them before submit, otherwise
        // they'll be escaped instead of actual objects
        const jsonTypes = Object.keys(schema.schema.properties).filter(
          key => schema.schema.properties[key].format === 'json',
        );
        if (jsonTypes.length) {
          // We have to clone the body object, otherwise the form
          // will attempt to re-render with an object, which will
          // cause it to error!
          const cloned = JSON.parse(JSON.stringify(formData.body));
          jsonTypes.forEach(prop => {
            // Attempt to JSON parse each of the json properties
            // if this errors, it'll just get caught and stringify it normally
            cloned[prop] = JSON.parse(cloned[prop]);
          });
          stringify(cloned);
        } else {
          stringify(formData.body);
        }
      } catch (e) {
        // If anything goes wrong in the above, assume that it's invalid JSON
        // and stringify it
        stringify(formData.body);
      }
    }
  }

  // Add content-type header if there are any body values setup above ^^
  // or if there is a schema defined
  if (har.postData.text || Object.keys(schema.schema).length) {
    const type = getContentType(pathOperation);
    har.headers.push({
      name: 'Content-Type',
      value: contentType || type,
    });
  }

  const securityRequirements = pathOperation.security || oas.security;
  if (securityRequirements && securityRequirements.length) {
    // TODO pass these values through the formatter?
    securityRequirements.forEach(schemes => {
      Object.keys(schemes).forEach(security => {
        const securityValue = configureSecurity(oas, auth, security, pathOperation.securityDefinitions);

        if (!securityValue) return;
        har[securityValue.type].push(securityValue.value);
      });
    });
  }
  return { log: { entries: [{ request: har }] } };
};

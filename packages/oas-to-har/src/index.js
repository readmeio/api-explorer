const extensions = require('@readme/oas-extensions');
const { findSchemaDefinition, getSchema, parametersToJsonSchema } = require('@readme/oas-tooling/utils');
const { Operation } = require('@readme/oas-tooling');
const parseDataUrl = require('parse-data-url');

const configureSecurity = require('./lib/configure-security');
const removeUndefinedObjects = require('./lib/remove-undefined-objects');

function formatter(values, param, type, onlyIfExists) {
  if (typeof values[type][param.name] !== 'undefined') {
    return values[type][param.name];
  }

  if (onlyIfExists && !param.required) {
    return undefined;
  }

  if (param.required && param.schema && param.schema.default) {
    return param.schema.default;
  }

  // If we don't have any values for the path parameter, just use the name of the parameter as the value so we don't
  // try try to build a URL to something like `https://example.com/undefined`.
  if (type === 'path') {
    return param.name;
  }

  return undefined;
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

function stringify(json) {
  return JSON.stringify(removeUndefinedObjects(typeof json.RAW_BODY !== 'undefined' ? json.RAW_BODY : json));
}

module.exports = (
  oas,
  operationSchema = { path: '', method: '' },
  values = {},
  auth = {},
  opts = {
    // If true, the operation URL will be rewritten and prefixed with https://try.readme.io/ in order to funnel requests
    // through our CORS-friendly proxy.
    proxyUrl: false,
  }
) => {
  let operation = operationSchema;
  if (!(operationSchema instanceof Operation)) {
    operation = new Operation(oas, operationSchema.path, operationSchema.method, operationSchema);
  }

  const formData = { ...defaultFormDataTypes, ...values };
  const har = {
    cookies: [],
    headers: [],
    headersSize: 0,
    queryString: [],
    postData: {},
    bodySize: 0,
    method: operation.method.toUpperCase(),
    url: `${oas.url()}${operation.path}`.replace(/\s/g, '%20'),
    httpVersion: 'HTTP/1.1',
  };

  const proxyEnabled =
    operation[extensions.PROXY_ENABLED] !== undefined
      ? operation[extensions.PROXY_ENABLED]
      : oas[extensions.PROXY_ENABLED];
  // TODO look to move this to Oas class as well
  if (proxyEnabled && opts.proxyUrl) {
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

  // Do we have any `cookie` parameters on the operation?
  const cookies = parameters && parameters.filter(param => param.in === 'cookie');
  if (cookies && cookies.length) {
    cookies.forEach(cookie => {
      const value = formatter(formData, cookie, 'cookie', true);
      if (typeof value === 'undefined') return;

      har.cookies.push({
        name: cookie.name,
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
  let contentType = operation.getContentType();
  const headers = parameters && parameters.filter(param => param.in === 'header');
  if (headers && headers.length) {
    headers.forEach(header => {
      const value = formatter(formData, header, 'header', true);
      if (typeof value === 'undefined') return;

      if (header.name.toLowerCase() === 'content-type') {
        hasContentType = true;
        contentType = String(value);
      }

      har.headers.push({
        name: header.name,
        value: String(value),
      });
    });
  }

  // Are there `x-static` static headers configured for this OAS?
  const userDefinedHeaders =
    operation[extensions.HEADERS] !== undefined ? operation[extensions.HEADERS] : oas[extensions.HEADERS];
  if (userDefinedHeaders) {
    userDefinedHeaders.forEach(header => {
      if (header.key.toLowerCase() === 'content-type') {
        hasContentType = true;
        contentType = String(header.value);
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
  if (schema.schema && Object.keys(schema.schema).length) {
    if (operation.isFormUrlEncoded()) {
      if (Object.keys(formData.formData).length) {
        har.postData.params = [];
        har.postData.mimeType = 'application/x-www-form-urlencoded';

        Object.keys(formData.formData).forEach(name => {
          har.postData.params.push({
            name,
            value: String(formData.formData[name]),
          });
        });
      }
    } else if (
      'body' in formData &&
      formData.body !== undefined &&
      (isPrimitive(formData.body) || Object.keys(formData.body).length)
    ) {
      const isMultipart = operation.isMultipart();
      const isJSON = operation.isJson();

      if (isMultipart || isJSON) {
        try {
          let cleanBody = removeUndefinedObjects(JSON.parse(JSON.stringify(formData.body)));

          if (isMultipart) {
            har.postData.mimeType = 'multipart/form-data';
            har.postData.params = [];

            // Discover all `{ type: string, format: binary }` properties the schema. If there are any, then that means
            // that we're dealing with a `multipart/form-data` request and need to treat the payload as `postData.params`.
            const binaryTypes = Object.keys(schema.schema.properties).filter(
              key => schema.schema.properties[key].format === 'binary'
            );

            if (cleanBody !== undefined) {
              Object.keys(cleanBody).forEach(name => {
                // We neither have an easy way to transform `name` into `name[]` to signify that it's an array payload
                // (and for all we know it might be an array of objects!), but also at the same time the HAR spec
                // doesn't give any guidance for these kinds of cases so instead we're just falling back to
                // stringifying the content instead of potentially including `fileName` properties.
                if (Array.isArray(cleanBody[name])) {
                  har.postData.params.push({
                    name,
                    value: JSON.stringify(cleanBody[name]),
                  });

                  return;
                }

                const data = {
                  name,
                  value: String(cleanBody[name]),
                };

                // If we're dealing with a binary type, and the value is a valid data URL we should parse out any
                // available filename and content type to send along with the parameter to interpreters like `fetch-har`
                // can make sense of it and send a usable payload.
                if (binaryTypes.includes(name)) {
                  const parsed = parseDataUrl(data.value);
                  if (parsed) {
                    data.fileName = 'name' in parsed ? parsed.name : 'unknown';
                    if ('contentType' in parsed) {
                      data.contentType = parsed.contentType;
                    }
                  }
                }

                har.postData.params.push(data);
              });
            }
          } else {
            har.postData.mimeType = contentType;

            // Find all `{ type: string, format: json }` properties in the schema because we need to manually JSON.parse
            // them before submit, otherwise they'll be escaped instead of actual objects.
            const jsonTypes = Object.keys(schema.schema.properties).filter(
              key => schema.schema.properties[key].format === 'json'
            );

            if (jsonTypes.length) {
              try {
                jsonTypes.forEach(prop => {
                  // Attempt to parse each of the JSON properties, but if it fails for the data being invalid JSON,
                  // instead we'll catch the exception and handle it as raw text.
                  cleanBody[prop] = JSON.parse(cleanBody[prop]);
                });

                if (typeof cleanBody.RAW_BODY !== 'undefined') {
                  cleanBody = cleanBody.RAW_BODY;
                }

                har.postData.text = JSON.stringify(cleanBody);
              } catch (e) {
                har.postData.text = stringify(formData.body);
              }
            } else {
              har.postData.text = stringify(formData.body);
            }
          }
        } catch (e) {
          // If anything above fails for whatever reason, assume that whatever we had is invalid JSON and just treat it
          // as raw text.
          har.postData.text = stringify(formData.body);
        }
      } else {
        har.postData.mimeType = contentType;
        if (isPrimitive(formData.body)) {
          har.postData.text = formData.body;
        } else {
          har.postData.text = stringify(formData.body);
        }
      }
    }
  }

  // Add a `Content-Type` header if there are any body values setup above or if there is a schema defined, but only do
  // so if we don't already have a `Content-Type` present as it's impossible for a request to have multiple.
  if ((har.postData.text || Object.keys(schema.schema).length) && !hasContentType) {
    har.headers.push({
      name: 'Content-Type',
      value: contentType,
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

  // If we didn't end up filling the `postData` object then we don't need it.
  if (Object.keys(har.postData).length === 0) {
    delete har.postData;
  }

  return { log: { entries: [{ request: har }] } };
};

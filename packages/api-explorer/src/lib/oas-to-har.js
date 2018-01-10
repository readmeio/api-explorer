const querystring = require('querystring');

const extensions = require('@readme/oas-extensions');
const getSchema = require('./get-schema');
const configureSecurity = require('./configure-security');

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
  if (values[type][param.name]) {
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
  const types =
    (pathOperation &&
      pathOperation.requestBody &&
      pathOperation.requestBody.content &&
      Object.keys(pathOperation.requestBody.content)) ||
    [];

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

module.exports = (
  oas,
  pathOperation = { path: '', method: '' },
  values = {},
  opts = { proxyUrl: false },
) => {
  const formData = Object.assign({}, defaultValues, values);
  const har = {
    headers: [],
    queryString: [],
    postData: {},
    method: pathOperation.method.toUpperCase(),
    url: `${oas.servers ? oas.servers[0].url : ''}${pathOperation.path}`.replace(/\s/g, '%20'),
  };

  if (oas[extensions.PROXY_ENABLED] && opts.proxyUrl) {
    har.url = `https://try.readme.io/${har.url}`;
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
      if (!value) return;
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
      if (!value) return;
      har.headers.push({
        name: header.name,
        value: String(value),
      });
    });
  }

  const schema = getSchema(pathOperation) || { schema: {} };

  if (schema.schema && Object.keys(schema.schema).length) {
    // If there is formData, then the type is application/x-www-form-urlencoded
    if (Object.keys(formData.formData).length) {
      har.postData.text = querystring.stringify(formData.formData);
    } else if (Object.keys(formData.body).length) {
      // Default to JSON.stringify
      har.postData.text = JSON.stringify(formData.body);
    }
  }

  // Add content-type header if there are any body values setup above ^^
  // or if there is a schema defined
  if (har.postData.text || Object.keys(schema.schema).length) {
    const type = getContentType(pathOperation);
    har.headers.push({
      name: 'Content-Type',
      value: type,
    });
  }

  const securityRequirements = pathOperation.security || oas.security;

  if (securityRequirements && securityRequirements.length) {
    // TODO pass these values through the formatter?
    securityRequirements.forEach(schemes => {
      Object.keys(schemes).forEach(security => {
        const securityValue = configureSecurity(oas, formData, security);

        if (!securityValue) return;
        har[securityValue.type].push(securityValue.value);
      });
    });
  }
  return { log: { entries: [{ request: har }] } };
};

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

const defaultValues = Object.keys(require('./parameters-to-json-schema').types).reduce((prev, curr) => {
  return Object.assign(prev, { [curr]: {} });
}, {});

module.exports = (oas, path = '', method = '', values = {}) => {
  const formData = Object.assign({}, defaultValues, values);
  const har = {
    headers: [],
    queryString: [],
    postData: {},
    method: method.toUpperCase(),
    url: `${oas.servers ? oas.servers[0].url : ''}${path}`.replace(/\s/g, '%20'),
  };

  const pathOperation = oas.paths && oas.paths[path] && oas.paths[path][method];

  har.url = har.url.replace(/{([-_a-zA-Z0-9[\]]+)}/g, (full, key) => {
    if (!pathOperation || !pathOperation.parameters) return key; // No path params at all
    // Find the path parameter or set a default value if it does not exist
    const parameter = pathOperation.parameters.find(param => param.name === key) || { name: key };

    return encodeURIComponent(formatter(formData, parameter, 'path'));
  });

  return har;
};

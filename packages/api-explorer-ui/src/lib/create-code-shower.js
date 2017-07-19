module.exports = function (type) {
  return function (endpoint) {
    endpoint._cache = endpoint._cache || {};

    if (endpoint._cache[type]) return endpoint._cache[type];

    const codes = [];
    if (type === 'results') { // Only examples so far...
      Object.keys(endpoint.responses || {}).forEach((status) => {
        const response = endpoint.responses[status];

        if (response.examples) {
          const lang = Object.keys(response.examples)[0];
          const example = response.examples[lang];

          codes.push({
            code: _.isObject(example) ? JSON.stringify(example, undefined, 2) : example,
            language: lang,
            status,
          });
        }
      });
    }

    endpoint._cache[type] = codes;
    return codes;
  };
};

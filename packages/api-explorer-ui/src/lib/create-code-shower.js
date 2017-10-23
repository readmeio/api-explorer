module.exports = type => {
  return function results(pathOperation) {
    pathOperation._cache = pathOperation._cache || {};

    if (pathOperation._cache[type]) return pathOperation._cache[type];

    const codes = [];
    if (type === 'results') {
      // Only examples so far...
      Object.keys(pathOperation.responses || {}).forEach(status => {
        const response = pathOperation.responses[status];
        let lang;
        if (response.content) {
          lang = Object.keys(response.content)[0];
        } else if (!response.content) {
          return;
        }

        let example;

        if (response.content[lang].examples) {
          example = response.content[lang].examples.response.value;
        } else if (!response.content[lang].examples) {
          return;
        }

        if (example) {
          codes.push({
            code: typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
            language: lang,
            status,
          });
        }
      });
    }

    pathOperation._cache[type] = codes;
    return codes;
  };
};

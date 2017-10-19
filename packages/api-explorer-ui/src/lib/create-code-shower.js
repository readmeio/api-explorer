module.exports = type => {
  return pathOperation => {
    pathOperation._cache = pathOperation._cache || {};

    if (pathOperation._cache[type]) return pathOperation._cache[type];

    const codes = [];
    if (type === 'results') {
      // Only examples so far...
      Object.keys(pathOperation.responses || {}).forEach(status => {
        const response = pathOperation.responses[status];
        const lang = Object.keys(response.content)[0];
        const example = response.content[lang].examples.response.value;

        if (example) {
          codes.push({
            code: lang === 'application/json' ? JSON.stringify(example, undefined, 2) : example,
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

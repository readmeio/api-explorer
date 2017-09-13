module.exports = type => {
  return pathOperation => {
    pathOperation._cache = pathOperation._cache || {};

    if (pathOperation._cache[type]) return pathOperation._cache[type];

    const codes = [];
    if (type === 'results') {
      // Only examples so far...
      Object.keys(pathOperation.responses || {}).forEach(status => {
        const response = pathOperation.responses[status];

        if (response.examples) {
          // const lang = Object.keys(response.examples)[0];
          // const example = response.examples[lang];
          // codes.push({
          //   code: _.isObject(example) ? JSON.stringify(example, undefined, 2) : example,
          //   language: lang,
          //   status,
          // });
        }
      });
    }

    pathOperation._cache[type] = codes;
    return codes;
  };
};

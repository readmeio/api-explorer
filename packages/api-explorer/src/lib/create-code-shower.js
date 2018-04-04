function getLanguage(response) {
  return response.content ? Object.keys(response.content)[0] : '';
}

function getExample(response, lang) {
  return response.content[lang].examples ? response.content[lang].examples.response.value : '';
}

module.exports = type => {
  return pathOperation => {
    // Only working for results
    if (type !== 'results') return [];

    pathOperation._cache = pathOperation._cache || {};

    if (pathOperation._cache[type]) return pathOperation._cache[type];

    const codes = Object.keys(pathOperation.responses || {})
      .map(status => {
        const response = pathOperation.responses[status];

        const language = response.language || getLanguage(response);
        if (!language) return false;

        const example = response.code || getExample(response, language);
        if (!example) return false;

        return {
          code: typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
          language,
          status,
        };
      })
      .filter(Boolean);

    pathOperation._cache[type] = codes;
    return codes;
  };
};

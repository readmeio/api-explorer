function getLanguage(response) {
  return response.content ? Object.keys(response.content)[0] : '';
}

function getExample(response, lang) {
  return response.content[lang].examples && response.content[lang].examples.response
    ? response.content[lang].examples.response.value
    : '';
}

function getMultipleExamples(response, lang) {
  if (!response.content[lang].examples || response.content[lang].examples.response) return '';

  const { examples } = response.content[lang];
  return Object.keys(examples).map(key => {
    return {
      label: key,
      code:
        typeof examples[key] === 'object'
          ? JSON.stringify(examples[key], undefined, 2)
          : examples[key],
    };
  });
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
        const multipleExamples = getMultipleExamples(response, language);
        if (!example && !multipleExamples) return false;

        return {
          code: typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
          multipleExamples,
          language,
          status,
        };
      })
      .filter(Boolean);

    pathOperation._cache[type] = codes;
    return codes;
  };
};

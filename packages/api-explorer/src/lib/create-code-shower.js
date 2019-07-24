function getLanguage(response) {
  return response.content ? Object.keys(response.content)[0] : '';
}

function getLanguages(response) {
  return response.content ? Object.keys(response.content) : '';
}

function hasMultipleLanguages(response) {
  return response.content ? Object.keys(response.content).length > 1 : false;
}

function getExample(response, lang) {
  return response.content[lang].examples && response.content[lang].examples.response
    ? response.content[lang].examples.response.value
    : '';
}

function getMultipleExamples(response, lang) {
  if (!response.content[lang].examples || response.content[lang].examples.response) return false;

  const examples = response.content[lang].examples;
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

        const languages = [];
        if (hasMultipleLanguages(response)) {
          getLanguages(response).forEach(language => {
            if (!language) return false;

            const langResponse = response.content[language];
            const example = langResponse.code || getExample(response, language);
            const multipleExamples = getMultipleExamples(response, language);
            if (!example && !multipleExamples) return false;

            languages.push({
              language,
              code: typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
              multipleExamples,
            });

            return true;
          });

          if (languages.length === 0) return false;
        } else {
          const language = response.language || getLanguage(response);
          if (!language) return false;

          const example = response.code || getExample(response, language);
          const multipleExamples = getMultipleExamples(response, language);
          if (!example && !multipleExamples) return false;

          languages.push({
            language,
            code: typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
            multipleExamples,
          });
        }

        return {
          status,
          languages,
        };
      })
      .filter(Boolean);

    pathOperation._cache[type] = codes;
    return codes;
  };
};

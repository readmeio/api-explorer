// The functions in this file are tested inside of ReadMe's main repository.
function varReplacer(variables, defaults = [], glossaryTerms) {
  return (match, value) => {
    let v = value;
    let isDefault = false;

    // Handle glossary terms
    if (v.indexOf('glossary:') === 0) {
      const term = v.replace('glossary:', '');

      const foundTerm = glossaryTerms.filter(gTerm => term === gTerm.term)[0];
      if (foundTerm) {
        return `
            <span class="glossary-tooltip" v=${foundTerm.term}>
              <span class="glossary-item highlight">${foundTerm.term} </span>
              <span class="tooltip-content">
                <span class="tooltip-content-body">
                  - <strong class="term">${foundTerm.term}</strong> -
                  ${foundTerm.definition}
                </span>
              </span>
            </span>
          `;
      }
    }

    // Don't break the <<keys:>> syntax
    if (v.indexOf('keys:') === 0) {
      // tombstone('keysVariableFormat', '2-23-2018', { var: v });
      [, v] = v.split('keys:');
    }

    let data = variables && variables[v] ? variables[v] : undefined;

    const inKeys = variables && variables.keys && variables.keys[0][v];
    const inVariables = variables && variables[v];

    // Use default
    if (!variables || !(inKeys || inVariables)) {
      isDefault = true;
      const userDefault = defaults.find(d => d.name === v);
      data = userDefault ? userDefault.default : v.toUpperCase();
    } else if (inKeys) {
      // Keys array was passed in
      // We figure out keys in the frontend (so we have selectedApp)
      return `<variable-keys v=${v} data="${v.toUpperCase()}"></variable-keys>`;
    }

    // Just a signle value
    return `<variable v=${v} data="${data}" isdefault="${isDefault}"></variable>`;
  };
}

module.exports = function replaceVars(userVariables, defaults, glossaryTerms, output) {
  let variables = userVariables;
  let out = output;
  // If no variables (either from default or jwt, don't change anything)
  if (!variables && !defaults) {
    return out;
  }

  // Variables will initially be string
  if (typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (e) {
      // TODO-JWT Try to figure out a way to deal with error
      return out;
    }
  }

  const replacer = varReplacer(variables, defaults, glossaryTerms);

  // &lt;&lt;variable name&gt;&gt;  &lt;&lt;glossary:variable name&gt;&gt;
  out = out.replace(/&lt;&lt;([-\w:\s]+)&gt;&gt;/g, replacer);
  // <<variable name>> <<glossary:variable name>>
  out = out.replace(/<<([-\w:\s]+)>>/g, replacer);

  // Makes \&lt;&lt;variable\&gt;&gt; display as &lt;&lt;variabl&gt;&gt; in the frontend
  out = out.replace(/\\&lt;&lt;([-\w:\s]+)\\&gt;&gt;/g, (match, v) => `&lt;&lt;${v}&gt;&gt;`);

  return out;
};

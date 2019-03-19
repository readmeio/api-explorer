function isEmptyObject(obj) {
  // Then remove all empty objects from the top level object
  return typeof obj === 'object' && Object.keys(obj).length === 0;
}

// Modified from here: https://stackoverflow.com/a/43781499
function stripEmptyObjects(obj) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'object' && !Array.isArray(obj) && value !== null) {
      // Recurse, strip out empty objects from children
      stripEmptyObjects(value);
      // Then remove all empty objects from the top level object
      if (isEmptyObject(value)) {
        delete obj[key];
      }
    }
  });
}

function removeUndefinedObjects(obj) {
  // JSON.stringify removes undefined values
  const withoutUndefined = JSON.parse(JSON.stringify(obj));

  // Then we recursively remove all empty objects
  stripEmptyObjects(withoutUndefined);

  // If the only thing that's leftover is an empty object
  // then return nothing so we don't end up with default
  // code samples with:
  // --data '{}'
  if (isEmptyObject(withoutUndefined)) return undefined;

  return withoutUndefined;
}

module.exports = removeUndefinedObjects;

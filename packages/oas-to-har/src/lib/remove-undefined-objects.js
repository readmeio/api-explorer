function isEmptyObject(obj) {
  // Then remove all empty objects from the top level object
  return typeof obj === 'object' && Object.keys(obj).length === 0;
}

// Modified from here: https://stackoverflow.com/a/43781499
function stripEmptyObjects(obj) {
  let cleanObj = obj;

  Object.keys(cleanObj).forEach(key => {
    let value = cleanObj[key];

    if (typeof value === 'object' && !Array.isArray(cleanObj) && value !== null) {
      // Recurse, strip out empty objects from children
      value = stripEmptyObjects(value);

      // Then remove all empty objects from the top level object
      if (isEmptyObject(value)) {
        delete cleanObj[key];
      } else {
        cleanObj[key] = value;
      }
    } else if (value === null) {
      delete cleanObj[key];
    }
  });

  if (Array.isArray(cleanObj)) {
    // Since deleting a key from an array will retain an undefined value in that array, we need to
    // filter them out.
    cleanObj = cleanObj.filter(function (el) {
      return el !== undefined;
    });
  }

  return cleanObj;
}

function removeUndefinedObjects(obj) {
  // JSON.stringify removes undefined values. Though `[undefined]` will be converted with this to
  // `[null]`, we'll clean that up next.
  let withoutUndefined = JSON.parse(JSON.stringify(obj));

  // Then we recursively remove all empty objects and nullish arrays.
  withoutUndefined = stripEmptyObjects(withoutUndefined);

  // If the only thing that's leftover is an empty object
  // then return nothing so we don't end up with default
  // code samples with:
  // --data '{}'
  if (isEmptyObject(withoutUndefined)) return undefined;

  return withoutUndefined;
}

module.exports = removeUndefinedObjects;

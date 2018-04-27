module.exports = (labelPrefix, label) => {
  return [labelPrefix, label]
    .filter(Boolean)
    .join('.')
    .replace(/RAW_BODY.?/, '');
};

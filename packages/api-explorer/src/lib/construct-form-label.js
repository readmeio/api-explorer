module.exports = (labelPrefix, label) => {
  return [labelPrefix, label]
    .filter(Boolean)
    .join('.')
    .replace(/TOP_LEVEL.?/, '');
};

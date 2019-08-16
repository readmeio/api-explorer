const commonParamsOas = require('./../fixtures/parameters/common');
const createDocs = require('../../lib/create-docs');

test('should not create a doc object for unrecognized http methods', () => {
  const docs = createDocs(commonParamsOas, 'api-setting');

  expect(docs.length).toBe(3);
});

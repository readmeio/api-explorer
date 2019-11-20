const statuscodes = require('../../src/lib/statuscodes');

test('should return with an array representing the code', () => {
  expect(statuscodes(200)).toStrictEqual([200, 'OK', 'success']);
  expect(statuscodes(400)).toStrictEqual([400, 'Bad Request', 'error']);
});

test('should return with undefined for invalid status code', () => {
  expect(statuscodes(1000)).toBeUndefined();
});

const statuscodes = require('../../src/lib/statuscodes');

test('should return with an array representing the code', () => {
  expect(statuscodes(200)).toEqual([200, 'OK', 'success']);
  expect(statuscodes(400)).toEqual([400, 'Bad Request', 'error']);
});

test('should return with undefined for invalid status code', () => {
  expect(statuscodes(1000)).toEqual(undefined);
});

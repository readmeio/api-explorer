#!/usr/bin/env node

const getStdin = require('get-stdin');
const CircularJSON = require('circular-json');
const refParser = require('json-schema-ref-parser');

(async () => {
  const stdin = await getStdin();
  const dereferenced = await refParser.dereference(JSON.parse(stdin));

  const circular = CircularJSON.stringify(dereferenced, null, 2);

  console.log(circular); // eslint-disable-line no-console
})();

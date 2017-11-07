const React = require('react');
const PropTypes = require('prop-types');
const marked = require('./lib/markdown/index');
// const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

function ResponseSchemaBody(schema, { rows = [] }) {
  let objName;
  for (const key in schema) {
    if (typeof schema[key] === 'object') {
      objName = key;
      ResponseSchemaBody(schema[key], rows);
    } else {
      rows.push(
        <tr key={key}>
          <th>{objName}</th>
          <td>
            {schema.type}
            {schema.description && marked(schema.description)}
          </td>
        </tr>,
      );
    }
  }
  const tableRow = rows.map(row => row);
  console.log(tableRow);
  // console.log(rows);
  // rows.map(row => <table>{row}</table>);
  return <table>{tableRow}</table>;
}

module.exports = ResponseSchemaBody;

ResponseSchemaBody.propTypes = {
  schema: PropTypes.shape({}).isRequired,
};

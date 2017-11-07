const React = require('react');
const PropTypes = require('prop-types');
const marked = require('./lib/markdown/index');
// const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

function ResponseSchemaBody({ schema }) {
  console.log({ schema });
  let objName;
  const rows = [];
  return (
    <table>
      {function recurseSchema() {
        for (const key in schema) {
          if (typeof schema[key] === 'object' && schema[key]) {
            objName = key;
            recurseSchema(schema[key]);
          } else {
            rows.push(
              <tr>
                <th>{objName}</th>
                <td>
                  {schema.type}
                  {schema.description && marked(schema.description)}
                </td>
              </tr>,
            );
          }
        }
        return rows;
      }}
      {rows.map(row => row)}
    </table>
  );
}

module.exports = ResponseSchemaBody;

ResponseSchemaBody.propTypes = {
  schema: PropTypes.shape({}).isRequired,
};

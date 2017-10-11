const React = require('react');
const PropTypes = require('prop-types');
// const marked = require('./lib/markdown/index');
// const convertToParams = require('../../../legacy-stuff/swagger');

function ResponseSchema({ swagger }) {
  const i = 0;
  return (
    <div className="hub-reference-response-definitions">
      <h3>
        <div className="pull-right">
          <select className="switcher-switch">
            {swagger._endpoint.response.forEach((response, status) => (
              <option value={status}>status</option>
            ))}
          </select>
          Response
        </div>
      </h3>
      {/* {swagger._endpoint.response.forEach((response, status) => {
        <div switcher={status} style={i === 0 ? '' : 'display: none'}>
          {response.description &&
            <p desc={response.description} />(
              response.schema &&
                response.schema.type === 'object' &&
                response.schema.properties,
            )(
              <table>
                {swaggerUtils.convertToParams([response], 'response').forEach(param => {
                  <tr>
                    <th>param.name</th>
                    <td>
                      param.type
                      {param.description && marked(param.description)}
                    </td>
                  </tr>;
                })}
              </table>,
            )}
        </div>;
      })} */}
    </div>
  );
}

ResponseSchema.PropTypes = {
  swagger: PropTypes.shape({}).isRequired,
};

module.exports = ResponseSchema;

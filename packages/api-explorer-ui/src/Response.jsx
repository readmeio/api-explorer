const React = require('react');
const PropTypes = require('prop-types');
const Oas = require('./lib/Oas');

const { Operation } = Oas;
// const marked = require('./lib/markdown/index');
// const convertToParams = require('../../../legacy-stuff/swagger');

class ResponseSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: Object.keys(props.operation.responses)[0],
    };
    this.selectedStatus = this.selectedStatus.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }
  selectedStatus(selected) {
    this.setState({ selectedStatus: selected });
  }

  changeHandler(e) {
    this.selectedStatus(e.target.value);
  }

  render() {
    const { operation } = this.props;
    const keys = Object.keys(operation.responses);

    // let schema;
    //
    // try {
    //   if (operation.responses[this.state.selectedStatus].content) {
    //     if (
    //       operation.responses[this.state.selectedStatus].content['application/json'].schema.type ===
    //         'object' &&
    //       operation.responses[this.state.selectedStatus].content['application/json'].schema
    //         .properties
    //     ) {
    //       schema =
    //         operation.responses[this.state.selectedStatus].content['application/json'].schema
    //           .properties;
    //     }
    //   } else if (
    //     operation.responses[this.state.selectedStatus].content['application/xml'].schema.type ===
    //       'object' &&
    //     operation.responses[this.state.selectedStatus].content['application/xml'].schema.properties
    //   ) {
    //     schema =
    //       operation.responses[this.state.selectedStatus].content['application/xml'].schema
    //         .properties;
    //   }
    // } catch (e) {} // eslint-disable-line no-empty

    return (
      <div className="hub-reference-response-definitions">
        <h3>
          <div className="pull-right">
            <select
              className="switcher-switch"
              value={this.state.selectedStatus}
              onChange={this.changeHandler}
            >
              {keys.map(status => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          Response
        </h3>
        <div>
          {operation.responses[this.state.selectedStatus].description && (
            <p className="desc">{operation.responses[this.state.selectedStatus].description}</p>
          )}
          {/* {schema && (
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
            </table>
          )} */}
        </div>
      </div>
    );
  }
}

ResponseSchema.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
};

module.exports = ResponseSchema;

const React = require('react');
const PropTypes = require('prop-types');
const Oas = require('./lib/Oas');
const ResponseSchemaBody = require('./ResponseSchemaBody');

const { Operation } = Oas;
let rows;

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

  renderHeader() {
    const keys = Object.keys(this.props.operation.responses);

    return (
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
    );
  }

  render() {
    const { operation } = this.props;
    const i = 0;
    const description = operation.responses[this.state.selectedStatus].description;
    let schema;

    try {
      if (operation.responses[this.state.selectedStatus].content) {
        const jsonSchema =
          operation.responses[this.state.selectedStatus].content['application/json'].schema;
        if (jsonSchema.type === 'object' && jsonSchema.properties) {
          schema = jsonSchema.properties;
        }
      }
    } catch (e) {} // eslint-disable-line no-empty

    return (
      <div className="hub-reference-response-definitions">
        {this.renderHeader()}
        <div style={i === 0 ? {} : { display: 'none' }}>
          {description && <p className="desc">{description}</p>}
          {schema && <ResponseSchemaBody obj={schema} />}
        </div>
      </div>
    );
  }
}

ResponseSchema.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
};

module.exports = ResponseSchema;

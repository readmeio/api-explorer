const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');

const Oas = require('./lib/Oas');
const findSchemaDefinition = require('./lib/find-schema-definition');
const ResponseSchemaBody = require('./ResponseSchemaBody');

const { Operation } = Oas;

class ResponseSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: Object.keys(props.operation.responses || {})[0],
    };
    this.selectedStatus = this.selectedStatus.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  getSchema(operation) {
    const content = this.getContent(operation);

    if (!content) return null;

    const oas = this.props.oas;

    const firstContentType = Object.keys(content)[0];

    if (
      content[firstContentType] &&
      content[firstContentType].schema &&
      content[firstContentType].schema.$ref
    ) {
      return findSchemaDefinition(content[firstContentType].schema.$ref, oas);
    }

    if (content[firstContentType] && content[firstContentType].schema) {
      return content[firstContentType].schema;
    }

    return null;
  }

  getContent(operation) {
    const status = this.state.selectedStatus;
    return (
      operation &&
      operation.responses &&
      operation.responses[status] &&
      operation.responses[status].content
    );
  }

  changeHandler(e) {
    this.selectedStatus(e.target.value);
  }

  selectedStatus(selected) {
    this.setState({ selectedStatus: selected });
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
    const { operation, oas } = this.props;
    if (!operation.responses || Object.keys(operation.responses).length === 0) return null;
    const schema = this.getSchema(operation);
    return (
      <div className={classNames({"hub-reference-response-definitions": true, 'dark': this.props.theme === 'dark' })}>
        {this.renderHeader()}
        <div className="response-schema">
          {operation.responses[this.state.selectedStatus].description && (
            <p className="desc">{operation.responses[this.state.selectedStatus].description}</p>
          )}
          {schema && <ResponseSchemaBody schema={schema} oas={oas} />}
        </div>
      </div>
    );
  }
}

ResponseSchema.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired,
  theme: PropTypes.string.isRequired,
};

module.exports = ResponseSchema;

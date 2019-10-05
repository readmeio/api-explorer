const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const markdown = require('@readme/markdown');

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
    const { oas } = this.props;
    const content = this.getContent(operation, oas);

    if (!content) return null;

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

  getContent(operation, oas) {
    const status = this.state.selectedStatus;
    const response = operation && operation.responses && operation.responses[status];

    if (!response) return false;

    if (response.$ref) return findSchemaDefinition(response.$ref, oas).content;
    return response.content;
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
      <div
        className={classNames('hub-reference-response-definitions', {
          dark: this.props.theme === 'dark',
        })}
      >
        {this.renderHeader()}
        <div className="response-schema">
          {operation.responses[this.state.selectedStatus].description && (
            <div className="desc">
              {markdown(operation.responses[this.state.selectedStatus].description)}
            </div>
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

const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const markdown = require('@readme/markdown');
const Oas = require('oas');
const { findSchemaDefinition } = require('oas/utils');

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

    if (content[firstContentType] && content[firstContentType].schema && content[firstContentType].schema.$ref) {
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
          <select className="switcher-switch" onChange={this.changeHandler} value={this.state.selectedStatus}>
            {keys.map(status => (
              <option key={status} value={status}>
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

    let response = operation.responses[this.state.selectedStatus];

    // @todo This should really be called higher up when the OAS is processed within the Doc component.
    if (response.$ref) {
      response = findSchemaDefinition(response.$ref, oas);
    }

    return (
      <div
        className={classNames('hub-reference-response-definitions', {
          dark: this.props.theme === 'dark',
        })}
      >
        {this.renderHeader()}
        <div className="response-schema">
          {response.description && <div className="desc">{markdown(response.description)}</div>}
          {schema && <ResponseSchemaBody oas={oas} schema={schema} />}
        </div>
      </div>
    );
  }
}

ResponseSchema.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  theme: PropTypes.string.isRequired,
};

module.exports = ResponseSchema;

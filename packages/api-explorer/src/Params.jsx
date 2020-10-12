const React = require('react');
const PropTypes = require('prop-types');
const Form = require('@readme/oas-form').default;
const slug = require('lodash.kebabcase');
const extensions = require('@readme/oas-extensions');

const { PasswordWidget, TextWidget, UpDownWidget } = require('@readme/oas-form/lib/components/widgets').default;

const Oas = require('@readme/oas-tooling');
const { parametersToJsonSchema } = require('@readme/oas-tooling/utils');

const createArrayField = require('./form-components/ArrayField');
const createBaseInput = require('./form-components/BaseInput');
const createFileWidget = require('./form-components/FileWidget');
const createSchemaField = require('./form-components/SchemaField');
const createSelectWidget = require('./form-components/SelectWidget');
const createTextareaWidget = require('./form-components/TextareaWidget');
const createURLWidget = require('./form-components/URLWidget');
const DescriptionField = require('./form-components/DescriptionField');
const UnsupportedField = require('./form-components/UnsupportedField');

const { Operation } = Oas;

class Params extends React.Component {
  constructor(props) {
    super(props);

    const { oas, operation } = this.props;

    this.jsonSchema = parametersToJsonSchema(operation, oas);

    // If this operation doesn't have a set operationID (it's not required per the spec!) generate a hash off the
    // path+method to be one so we have unique form IDs across the explorer.
    if ('operationId' in operation) {
      this.operationId = operation.operationId;
    } else {
      this.operationId = slug(`${operation.method} ${operation.path}`).replace(/-/g, '');
    }
  }

  render() {
    const {
      ArrayField,
      BaseInput,
      FileWidget,
      formData,
      onChange,
      onSubmit,
      SchemaField,
      SelectWidget,
      TextareaWidget,
      URLWidget,
      useNewMarkdownEngine,
    } = this.props;

    return (
      <div id={`form-${this.perationId}`}>
        {this.jsonSchema &&
          this.jsonSchema.map(schema => {
            return [
              <div key={`${schema.type}-header`} className="param-type-header">
                <h3>{schema.label}</h3>
                <div className="param-header-border" />
              </div>,
              <Form
                key={`${schema.type}-form`}
                fields={{
                  ArrayField,
                  DescriptionField,
                  SchemaField,
                  UnsupportedField,
                }}
                formContext={{
                  useNewMarkdownEngine,
                }}
                formData={formData[schema.type]}
                id={`form-${schema.type}-${this.operationId}`}
                idPrefix={`${schema.type}-${this.operationId}`}
                onChange={form => {
                  return onChange({ [schema.type]: form.formData });
                }}
                onSubmit={onSubmit}
                schema={schema.schema}
                widgets={{
                  // 🚧 If new supported formats are added here, they must also be added to `SchemaField.getCustomType`.
                  BaseInput,
                  binary: FileWidget,
                  blob: TextareaWidget,
                  byte: TextWidget,

                  // Due to the varying ways that `date` and `date-time` is utilized in API definitions for representing
                  // dates the lack of wide browser support, and that it's not RFC 3339 compliant we don't support the
                  // `date-time-local` input for `date-time` formats, instead treating them as general strings.
                  //
                  // @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Browser_compatibility
                  // @link https://tools.ietf.org/html/rfc3339
                  date: TextWidget,
                  dateTime: TextWidget,
                  'date-time': TextWidget,

                  double: UpDownWidget,
                  duration: TextWidget,
                  float: UpDownWidget,
                  html: TextareaWidget,
                  int8: UpDownWidget,
                  int16: UpDownWidget,
                  int32: UpDownWidget,
                  int64: UpDownWidget,
                  integer: UpDownWidget,
                  json: TextareaWidget,
                  password: PasswordWidget,
                  SelectWidget,
                  string: TextWidget,
                  timestamp: TextWidget,
                  uint8: UpDownWidget,
                  uint16: UpDownWidget,
                  uint32: UpDownWidget,
                  uint64: UpDownWidget,
                  uri: URLWidget,
                  url: URLWidget,
                  uuid: TextWidget,
                }}
              >
                <button style={{ display: 'none' }} type="submit" />
              </Form>,
            ];
          })}
      </div>
    );
  }
}

Params.propTypes = {
  ArrayField: PropTypes.func.isRequired,
  BaseInput: PropTypes.func.isRequired,
  FileWidget: PropTypes.func.isRequired,
  formData: PropTypes.shape({}).isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  SchemaField: PropTypes.func.isRequired,
  SelectWidget: PropTypes.func.isRequired,
  TextareaWidget: PropTypes.func.isRequired,
  URLWidget: PropTypes.func.isRequired,
  useNewMarkdownEngine: PropTypes.bool,
};

Params.defaultProps = {
  useNewMarkdownEngine: false,
};

function createParams(oas) {
  // eslint-disable-next-line react/display-name
  return props => {
    // eslint-disable-next-line react/prop-types
    const explorerEnabled = extensions.getExtension(extensions.EXPLORER_ENABLED, oas, props.operation);

    const ArrayField = createArrayField(explorerEnabled);
    const BaseInput = createBaseInput(explorerEnabled);
    const FileWidget = createFileWidget(explorerEnabled);
    const SchemaField = createSchemaField();
    const SelectWidget = createSelectWidget(explorerEnabled);
    const TextareaWidget = createTextareaWidget(explorerEnabled);
    const URLWidget = createURLWidget(explorerEnabled);

    return (
      <Params
        {...props}
        ArrayField={ArrayField}
        BaseInput={BaseInput}
        FileWidget={FileWidget}
        SchemaField={SchemaField}
        SelectWidget={SelectWidget}
        TextareaWidget={TextareaWidget}
        URLWidget={URLWidget}
      />
    );
  };
}

module.exports = createParams;

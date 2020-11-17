const React = require('react');
const PropTypes = require('prop-types');
const Form = require('@readme/oas-form').default;
const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');

const syntaxHighlighter =
  typeof window !== 'undefined' ? require('@readme/syntax-highlighter/dist/index.js').default : () => {};

const { PasswordWidget, TextWidget, UpDownWidget } = require('@readme/oas-form/src/components/widgets').default;
const { Button, Tabs } = require('@readme/ui/.bundles/es/ui/components');

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

    const { operation } = this.props;

    this.jsonSchema = operation.getParametersAsJsonSchema();
    this.operationId = operation.getOperationId();

    this.onModeChange = this.onModeChange.bind(this);
  }

  onModeChange(mode) {
    return this.props.onModeChange(mode);
  }

  getForm(schema) {
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
      </Form>
    );
  }

  render() {
    const { enableJsonEditor, formDataRawJson, onRawJsonChange, resetForm, validationErrors } = this.props;

    return (
      <div id={`form-${this.operationId}`}>
        {this.jsonSchema &&
          this.jsonSchema.map(schema => {
            return (
              <React.Fragment key={`${schema.type}-block`}>
                {enableJsonEditor ? (
                  <React.Fragment>
                    <div key={`${schema.type}-header`} className="param-type-header">
                      <h3>{schema.label}</h3>
                      <div className="param-header-border" />
                    </div>

                    <Tabs onClick={this.onModeChange}>
                      <div label="Form">{this.getForm(schema)}</div>
                      <div label="JSON">
                        {syntaxHighlighter(
                          JSON.stringify(formDataRawJson, undefined, 2),
                          'json',
                          { editable: true },
                          {
                            onChange: (editor, data, value) => {
                              return onRawJsonChange(value);
                            },
                          }
                        )}

                        {validationErrors.json && <div>Invalid JSON</div>}

                        <Button bem={{ [`red_text`]: true }} onClick={resetForm}>
                          Reset
                        </Button>
                      </div>
                    </Tabs>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div key={`${schema.type}-header`} className="param-type-header">
                      <h3>{schema.label}</h3>
                      <div className="param-header-border" />
                    </div>

                    {this.getForm(schema)}
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })}
      </div>
    );
  }
}

Params.propTypes = {
  ArrayField: PropTypes.func.isRequired,
  BaseInput: PropTypes.func.isRequired,
  enableJsonEditor: PropTypes.bool,
  FileWidget: PropTypes.func.isRequired,
  formData: PropTypes.shape({}).isRequired,
  formDataRawJson: PropTypes.any.isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired,
  onChange: PropTypes.func.isRequired,
  onModeChange: PropTypes.func.isRequired,
  onRawJsonChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  resetForm: PropTypes.func.isRequired,
  SchemaField: PropTypes.func.isRequired,
  SelectWidget: PropTypes.func.isRequired,
  TextareaWidget: PropTypes.func.isRequired,
  URLWidget: PropTypes.func.isRequired,
  useNewMarkdownEngine: PropTypes.bool,
  validationErrors: PropTypes.shape({
    form: PropTypes.bool,
    json: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
};

Params.defaultProps = {
  enableJsonEditor: false,
  useNewMarkdownEngine: false,
};

function createParams(oas, operation) {
  const explorerEnabled = extensions.getExtension(extensions.EXPLORER_ENABLED, oas, operation);

  // These component creation methods should remain **outside** of the function that `createParams` returns because
  // anytime data within the form is edited we don't want to recreate every form component at the same time as this
  // introduces the possibility of the user input losing focus.
  //
  // This unfortunately can't be easily tested without introducing Puppeteer testing of the explorer as
  // `document.activeElement` isn't exposed within Enzyme (and also Enzyme is deprecating the `.simulate()` method it
  // provides which will make it even more difficult to determine which element is in focus).
  //
  // https://github.com/readmeio/api-explorer/commit/2313073711f3bb7b40df6e33eaf403e62caa22a3
  // https://github.com/enzymejs/enzyme/issues/2173#issuecomment-505551552
  const ArrayField = createArrayField(explorerEnabled);
  const BaseInput = createBaseInput(explorerEnabled);
  const FileWidget = createFileWidget(explorerEnabled);
  const SchemaField = createSchemaField();
  const SelectWidget = createSelectWidget(explorerEnabled);
  const TextareaWidget = createTextareaWidget(explorerEnabled);
  const URLWidget = createURLWidget(explorerEnabled);

  // eslint-disable-next-line react/display-name
  return props => {
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

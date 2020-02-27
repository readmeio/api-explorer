const React = require('react');
const PropTypes = require('prop-types');
const Form = require('@readme/react-jsonschema-form').default;

// const DateTimeWidget = require('@readme/react-jsonschema-form/lib/components/widgets/DateTimeWidget').default;
const PasswordWidget = require('@readme/react-jsonschema-form/lib/components/widgets/PasswordWidget').default;
const TextWidget = require('@readme/react-jsonschema-form/lib/components/widgets/TextWidget').default;
const UpDownWidget = require('@readme/react-jsonschema-form/lib/components/widgets/UpDownWidget').default;

const Oas = require('@readme/oas-tooling');
const { parametersToJsonSchema } = require('@readme/oas-tooling/utils');

const DescriptionField = require('./form-components/DescriptionField');
const createBaseInput = require('./form-components/BaseInput');
const createSelectWidget = require('./form-components/SelectWidget');
const createArrayField = require('./form-components/ArrayField');
const createSchemaField = require('./form-components/SchemaField');
const createTextareaWidget = require('./form-components/TextareaWidget');
const createFileWidget = require('./form-components/FileWidget');
const createURLWidget = require('./form-components/URLWidget');

const { Operation } = Oas;

function Params({
  ArrayField,
  BaseInput,
  FileWidget,
  formData,
  oas,
  onChange,
  onSubmit,
  operation,
  SchemaField,
  SelectWidget,
  TextareaWidget,
  URLWidget,
}) {
  const jsonSchema = parametersToJsonSchema(operation, oas);

  return (
    jsonSchema &&
    jsonSchema.map(schema => {
      return [
        <div key={`${schema.type}-header`} className="param-type-header">
          <h3>{schema.label}</h3>
          <div className="param-header-border" />
        </div>,
        <Form
          key={`${schema.type}-form`}
          fields={{
            DescriptionField,
            ArrayField,
            SchemaField,
          }}
          formData={formData[schema.type]}
          id={`form-${operation.operationId}`}
          idPrefix={operation.operationId}
          onChange={form => {
            return onChange({ [schema.type]: form.formData });
          }}
          onSubmit={onSubmit}
          schema={schema.schema}
          widgets={{
            // If new supported formats are added here, they must also be added to `SchemaField.getCustomType`.
            BaseInput,
            binary: FileWidget,
            blob: TextareaWidget,
            byte: TextWidget,
            date: TextWidget,
            // Temporarily disabling support for rendering the datetime widget as RJSF appears to be disabling it in
            // browsers that don't fully support it.
            /* dateTime: DateTimeWidget,
            'date-time': DateTimeWidget, */
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
    })
  );
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
};

function createParams(oas) {
  const ArrayField = createArrayField(oas);
  const BaseInput = createBaseInput(oas);
  const FileWidget = createFileWidget(oas);
  const SchemaField = createSchemaField();
  const SelectWidget = createSelectWidget(oas);
  const TextareaWidget = createTextareaWidget(oas);
  const URLWidget = createURLWidget(oas);

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

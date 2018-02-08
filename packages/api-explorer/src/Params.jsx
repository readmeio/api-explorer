const React = require('react');
const PropTypes = require('prop-types');
const Form = require('react-jsonschema-form').default;
const UpDownWidget = require('react-jsonschema-form/lib/components/widgets/UpDownWidget').default;
const TextWidget = require('react-jsonschema-form/lib/components/widgets/TextWidget').default;
const FileWidget = require('react-jsonschema-form/lib/components/widgets/FileWidget').default;
const DateTimeWidget = require('react-jsonschema-form/lib/components/widgets/DateTimeWidget')
  .default;

const ObjectField = require('./form-components/ObjectField');
const SchemaField = require('./form-components/SchemaField');
const FieldTemplate = require('./form-components/FieldTemplate');
const DescriptionField = require('./form-components/DescriptionField');
const CheckboxWidget = require('./form-components/CheckboxWidget');

const Oas = require('./lib/Oas');

const { Operation } = Oas;
const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

function Params({ oas, operation, formData, onChange, onSubmit }) {
  const jsonSchema = parametersToJsonSchema(operation, oas);
  return (
    <div className="api-manager">
      <div className="param-table">
        {jsonSchema &&
          jsonSchema.map(schema => {
            return [
              <div className="param-header" key={`${schema.type}-header`}>
                <h3>{schema.label}</h3>
                <div className="param-header-border" />
              </div>,
              <Form
                key={`${schema.type}-form`}
                id={`form-${operation.operationId}`}
                schema={schema.schema}
                widgets={{
                  int64: UpDownWidget,
                  int32: UpDownWidget,
                  double: UpDownWidget,
                  float: UpDownWidget,
                  binary: FileWidget,
                  byte: TextWidget,
                  uuid: TextWidget,
                  duration: TextWidget,
                  dateTime: DateTimeWidget,
                  integer: UpDownWidget,
                  CheckboxWidget,
                  TextWidget,
                }}
                onSubmit={onSubmit}
                formData={formData[schema.type]}
                onChange={form => {
                  // return onChange({ [schema.type]: { $set: form.formData } })
                  return onChange({ [schema.type]: form.formData });
                }}
                FieldTemplate={FieldTemplate}
                fields={{
                  ObjectField,
                  SchemaField,
                  TitleField: () => null,
                  DescriptionField,
                }}
              >
                <button type="submit" style={{ display: 'none' }} />
              </Form>,
            ];
          })}
      </div>
    </div>
  );
}

Params.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

module.exports = Params;

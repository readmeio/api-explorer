const React = require('react');
const PropTypes = require('prop-types');
const Form = require('react-jsonschema-form').default;
const UpDownWidget = require('react-jsonschema-form/lib/components/widgets/UpDownWidget').default;
const TextWidget = require('react-jsonschema-form/lib/components/widgets/TextWidget').default;
const FileWidget = require('react-jsonschema-form/lib/components/widgets/FileWidget').default;
const DateTimeWidget = require('react-jsonschema-form/lib/components/widgets/DateTimeWidget')
  .default;

// const DescriptionField = require('./form-components/DescriptionField');
const createBaseInput = require('./form-components/BaseInput');
const createSelectWidget = require('./form-components/SelectWidget');
const createArrayField = require('./form-components/ArrayField');
const createSchemaField = require('./form-components/SchemaField');
const Oas = require('./lib/Oas');

const { Operation } = Oas;
const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

function Params({ oas, operation, formData, onChange, onSubmit }) {
  const jsonSchema = parametersToJsonSchema(operation, oas);
  const BaseInput = createBaseInput(oas);
  const SelectWidget = createSelectWidget(oas);
  const ArrayField = createArrayField(oas);
  const SchemaField = createSchemaField();

  return (
    jsonSchema &&
    jsonSchema.map(schema => {
      return [
        <div className="param-type-header" key={`${schema.type}-header`}>
          <h3>{schema.label}</h3>
          <div className="param-header-border" />
        </div>,
        <Form
          key={`${schema.type}-form`}
          id={`form-${operation.operationId}`}
          idPrefix={operation.operationId}
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
            BaseInput,
            SelectWidget,
          }}
          onSubmit={onSubmit}
          formData={formData[schema.type]}
          onChange={form => {
            return onChange({ [schema.type]: form.formData });
          }}
          fields={{
            //  DescriptionField,
            ArrayField,
            SchemaField,
          }}
        >
          <button type="submit" style={{ display: 'none' }} />
        </Form>,
      ];
    })
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

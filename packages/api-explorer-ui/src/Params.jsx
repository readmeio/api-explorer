const React = require('react');
const PropTypes = require('prop-types');
const Form = require('react-jsonschema-form').default;
const UpDownWidget = require('react-jsonschema-form/lib/components/widgets/UpDownWidget').default;
const TextWidget = require('react-jsonschema-form/lib/components/widgets/TextWidget').default;

const TitleField = require('./form-components/TitleField');
const ObjectField = require('./form-components/ObjectField');

const Oas = require('./lib/Oas');

const { Operation } = Oas;
const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

// const REQUIRED_FIELD_SYMBOL = '*';

// function Label(props) {
//   const { label, required, id } = props;
//   if (!label) {
//     // See #312: Ensure compatibility with old versions of React.
//     return <div />;
//   }
//   return (
//     <label className="control-label" htmlFor={id}>
//       {required ? label + REQUIRED_FIELD_SYMBOL : label}
//     </label>
//   );
// }

// function CustomFieldTemplate(props) {
//   const {
//     id,
//     classNames,
//     label,
//     children,
//     errors,
//     help,
//     description,
//     hidden,
//     required,
//     displayLabel,
//   } = props;
//   if (hidden) {
//     return children;
//   }

//   return (
//     <div className={classNames}>
//       {displayLabel && <Label label={label} required={required} id={id} />}
//       {displayLabel && description ? description : null}
//       {children}
//       {errors}
//       {help}
//     </div>
//   );
// }

function Params({ oas, operation, formData, onChange }) {
  const jsonSchema = parametersToJsonSchema(operation, oas);

  return (
    <div className="api-manager">
      <div className="param-table">
        {jsonSchema &&
          jsonSchema.map(schema => {
            return (
              <div key={schema.type}>
                <div className="param-header">
                  <h3>{schema.label}</h3>
                  <div className="param-header-border" />
                </div>
                <Form
                  id={`form-${operation.operationId}`}
                  schema={schema.schema}
                  widgets={{ int64: UpDownWidget, int32: UpDownWidget, uuid: TextWidget }}
                  // eslint-disable-next-line no-console
                  onSubmit={form => console.log('submit', form.formData)}
                  formData={formData[schema.type]}
                  onChange={form => {
                    // return onChange({ [schema.type]: { $set: form.formData } })
                    return onChange({ [schema.type]: form.formData })
                  }}
                  // FieldTemplate={CustomFieldTemplate}
                  fields={{ObjectField, TitleField}}
                  className="param-table"
                >
                  <button type="submit" style={{ display: 'none' }} />
                </Form>
              </div>
            );
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
};

module.exports = Params;

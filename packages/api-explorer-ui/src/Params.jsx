const React = require('react');
const Form = require('react-jsonschema-form').default;

const UpDownWidget = require('react-jsonschema-form/lib/components/widgets/UpDownWidget').default;
const TextWidget = require('react-jsonschema-form/lib/components/widgets/TextWidget').default;

const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

module.exports = function Params({ oas, path, pathOperation, formData, onChange }) {
  // const paramGroups = groupParams(path, pathOperation);

  const jsonSchema = parametersToJsonSchema(pathOperation, oas);

  return (
    <div className="api-manager">
      {
        jsonSchema && (
        <Form
          id={`form-${pathOperation.operationId}`}
          schema={jsonSchema}
          widgets={{ int64: UpDownWidget, int32: UpDownWidget, uuid: TextWidget }}
          onSubmit={form => console.log('submit', form.formData)}
          formData={formData}
          onChange={form => onChange(form.formData)}
        ><button type="submit" style={{ display: 'none' }} /></Form>
        )
      }

      {
        // <div className="param-table">
        //   {
        //     Object.keys(paramGroups).map(type => <ParamGroup key={type} group={paramGroups[type]} />)
        //   }
        // </div>
      }

    </div>
  );
};

// function ParamGroup({ group }) {
//   return (
//     <span>
//       <div className="param-header"><h3>{group.name}</h3></div>
//       { group.params.map(param => <Param key={param.name} param={param} />) }
//     </span>
//   );
// }

// function Param({ param }) {
//   return (
//     <div className="param-item">
//       <div className="param-item-name">
//         <strong>{param.name}</strong>
//       </div>
//     </div>
//   );
// }

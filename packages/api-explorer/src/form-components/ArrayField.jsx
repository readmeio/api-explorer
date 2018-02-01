const React = require('react');
const PropTypes = require('prop-types');
const ArrayField = require('react-jsonschema-form/lib/components/fields/ArrayField').default;
// const TitleField = require('react-jsonschema-form/lib/components/fields/TitleField');
// const DescriptionField = require('react-jsonschema-form/lib/components/fields/DescriptionField');

// want it to extend playground/samples/customArray.js

class CustomArrayField extends ArrayField {
  render() {
    const { className, items, onAddClick } = this.props;

    return (
      <div className={className}>
        {items &&
          items.map(element => (
            <div key={element.index}>
              <div>{element.children}</div>
              <button onClick={element.onDropIndexClick(element.index)}>Delete</button>
              <i
                className="fa fa-times"
                aria-hidden="true"
                onClick={element.onDropIndexClick(element.index)}
              />
              <hr />
            </div>
          ))}

        <div className="row">
          <p className="col-xs-3 col-xs-offset-9 array-item-add text-right">
            <i className="fa fa-plus" aria-hidden="true" onClick={onAddClick} />
          </p>
        </div>
      </div>
    );
  }
}

// function ArrayFieldTitle({ idSchema, title, required }) {
//   if (!title) {
//     // See #312: Ensure compatibility with old versions of React.
//     return <div />;
//   }
//   const id = `${idSchema.$id}__title`;
//   return <TitleField id={id} title={title} required={required} />;
// }
//
// function ArrayFieldDescription({ idSchema, description }) {
//   if (!description) {
//     // See #312: Ensure compatibility with old versions of React.
//     return <div />;
//   }
//   const id = `${idSchema.$id}__description`;
//   return <DescriptionField id={id} description={description} />;
// }

// class CustomArrayField extends ArrayField {
//   render() {
//     return (
//       <fieldset className={this.props.className}>
//         {/* <ArrayFieldTitle
//           key={`array-field-title-${this.props.idSchema.$id}`}
//           TitleField={this.props.TitleField}
//           idSchema={this.props.idSchema}
//           title={this.props.uiSchema['ui:title'] || this.props.title}
//           required={this.props.required}
//         />
//
//         {(this.props.uiSchema['ui:description'] || this.props.schema.description) && (
//           <ArrayFieldDescription
//             key={`array-field-description-${this.props.idSchema.$id}`}
//             DescriptionField={this.props.DescriptionField}
//             idSchema={this.props.idSchema}
//             description={this.props.uiSchema['ui:description'] || this.props.schema.description}
//           />
//         )} */}
//
//         <div className="row array-item-list" key={`array-item-list-${this.props.idSchema.$id}`}>
//           <i
//             className="fa fa-times"
//             aria-hidden="true"
//             onClick={this.props.idSchema.$id.onDropIndexClick(this.props.idSchema.$id)}
//           />
//         </div>
//
//         <div className="row">
//           <p className="col-xs-3 col-xs-offset-9 array-item-add text-right">
//             <i className="fa fa-plus" aria-hidden="true" onClick={this.props.onAddClick} />
//           </p>
//         </div>
//       </fieldset>
//     );
//   }
// }

module.exports = CustomArrayField;

CustomArrayField.propTypes = {
  className: PropTypes.string,
  canAdd: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      hasRemove: PropTypes.bool.isRequired,
      index: PropTypes.number.isRequired,
      onDropIndexClick: PropTypes.func.isRequired,
    }),
  ).isRequired,
  onAddClick: PropTypes.func.isRequired,
};

CustomArrayField.defaultProps = {
  className: '',
};

// ArrayFieldTitle.propTypes = {
//   title: PropTypes.string.isRequired,
//   required: PropTypes.bool.isRequired,
//   idSchema: PropTypes.shape({}).isRequired,
//   TitleField: PropTypes.func.isRequired,
// };
//
// ArrayFieldDescription.propTypes = {
//   description: PropTypes.string.isRequired,
//   idSchema: PropTypes.shape({}).isRequired,
//   DescriptionField: PropTypes.func.isRequired,
// };

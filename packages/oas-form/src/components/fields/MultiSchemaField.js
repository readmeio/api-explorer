import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as types from '../../types';
import {
  getUiOptions,
  getWidget,
  guessType,
  retrieveSchema,
  getDefaultFormState,
  getMatchingOption,
  // deepEquals,
} from '../../utils';

class AnyOfField extends Component {
  constructor(props) {
    super(props);

    const { formData, options } = this.props;

    this.state = {
      selectedOption: this.getMatchingOption(formData, options),
    };
  }

  /* componentDidUpdate(prevProps, prevState) {
    if (
      !deepEquals(this.props.formData, prevProps.formData) &&
      this.props.idSchema.$id === prevProps.idSchema.$id
    ) {
      const matchingOption = this.getMatchingOption(
        this.props.formData,
        this.props.options
      );

      if (!prevState || matchingOption === this.state.selectedOption) {
        return;
      }

      this.setState({
        selectedOption: matchingOption,
      });
    }
  } */

  getMatchingOption(formData, options) {
    const option = getMatchingOption(formData, options);
    if (option !== 0) {
      return option;
    }
    // If the form data matches none of the options, use the currently selected
    // option, assuming it's available; otherwise use the first option
    return this && this.state ? this.state.selectedOption : 0;
  }

  onOptionChange = option => {
    const selectedOption = parseInt(option, 10);
    const { formData, onChange, options, registry } = this.props;
    const { rootSchema } = registry;
    const newOption = retrieveSchema(options[selectedOption], rootSchema, formData);

    // If the new option is of type object and the current data is an object,
    // discard properties added using the old option.
    let newFormData;
    if (guessType(formData) === 'object' && (newOption.type === 'object' || newOption.properties)) {
      newFormData = { ...formData };

      const optionsToDiscard = options.slice();
      optionsToDiscard.splice(selectedOption, 1);

      // Discard any data added using other options
      for (const opt of optionsToDiscard) {
        if (opt.properties) {
          for (const key in opt.properties) {
            if (newFormData.hasOwnProperty(key)) {
              delete newFormData[key];
            }
          }
        }
      }
    }
    // Call getDefaultFormState to make sure defaults are populated on change.
    onChange(getDefaultFormState(options[selectedOption], newFormData, rootSchema));

    this.setState({
      selectedOption: parseInt(option, 10),
    });
  };

  render() {
    const {
      baseType,
      disabled,
      discriminatorField,
      discriminatorMapping,
      errorSchema,
      formData,
      idPrefix,
      idSchema,
      onBlur,
      onChange,
      onFocus,
      options,
      registry,
      uiSchema,
      schema,
    } = this.props;

    const _SchemaField = registry.fields.SchemaField;
    const { widgets } = registry;
    const { selectedOption } = this.state;
    const { widget = 'select', ...uiOptions } = getUiOptions(uiSchema);
    const Widget = getWidget({ type: 'number' }, widget, widgets);

    const option = options[selectedOption] || null;
    let optionSchema;

    if (option) {
      // If the subschema doesn't declare a type, infer the type from the
      // parent schema
      optionSchema = option.type ? option : { ...option, type: baseType };
    }

    const enumOptions = options.map((opt, index) => ({
      label: opt.title || `Option ${index + 1}`,
      value: index,
    }));

    return (
      <div className="panel panel-default panel-body">
        <div className="form-group">
          {!discriminatorField && (
            <Widget
              id={`${idSchema.$id}${schema.oneOf ? '__oneof_select' : '__anyof_select'}`}
              onBlur={onBlur}
              onChange={this.onOptionChange}
              onFocus={onFocus}
              options={{ enumOptions }}
              schema={{ type: 'number', default: 0 }}
              value={selectedOption}
              {...uiOptions}
            />
          )}
          {discriminatorField}
        </div>

        {option !== null && (
          <_SchemaField
            disabled={disabled}
            errorSchema={errorSchema}
            formData={formData}
            idPrefix={idPrefix}
            idSchema={idSchema}
            onBlur={onBlur}
            onChange={onChange}
            onFocus={onFocus}
            registry={registry}
            schema={optionSchema}
            uiSchema={uiSchema}
          />
        )}
      </div>
    );
  }
}

AnyOfField.defaultProps = {
  disabled: false,
  errorSchema: {},
  idSchema: {},
  uiSchema: {},
};

if (process.env.NODE_ENV !== 'production') {
  AnyOfField.propTypes = {
    baseType: PropTypes.string,
    discriminatorField: PropTypes.function,
    discriminatorMapping: PropTypes.object,
    errorSchema: PropTypes.object,
    formData: PropTypes.any,
    idSchema: PropTypes.object,
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    registry: types.registry.isRequired,
    uiSchema: PropTypes.object,
  };
}

export default AnyOfField;

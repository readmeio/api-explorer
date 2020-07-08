/* eslint-disable react/no-did-mount-set-state */
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {injectIntl} from 'react-intl'
import {JSONEditor} from '@mia-platform/json-editor'
import {Spin, Alert} from 'antd'

import configureJsonEditor from './configureJsonEditor'
import resolveRootRef from './resolveRootRef'
import refReplacer from './refReplacer'
import './bootstrap4.css'
import './custom-bootstrap4.css'

class JsonForm extends Component {
  constructor(props) {
    super(props);
    this.editor = null;
    this.ref = null;

    this.state = {
      error: null,
      hasSchema: false
    }
    this.jsonSchema = null
  }

  componentDidMount() {
    const {schema} = this.props
    try {
      const convertedSchema = refReplacer(schema)
      const resolvedRoot = resolveRootRef(convertedSchema)
      this.jsonSchema = resolvedRoot
      return this.setState({
        hasSchema: true
      })
    }catch(err) {
      return this.setState({error: err.message, hasSchema: false})
    }
  }

  createEditor(element, jsonSchema) {
    const {intl, onChange, setFormSubmissionListener, title} = this.props
    if (this.editor !== null) {
      return
    }
    try {
      configureJsonEditor(JSONEditor, intl, setFormSubmissionListener)
      this.editor = new JSONEditor(element, {
        schema: {
          ...jsonSchema,
          title
        },
        show_opt_in: false,
        prompt_before_delete: false,
        form_name_root:"",
        iconlib: 'fontawesome5',
        theme: 'antdTheme',
        max_depth: 3,
        use_default_values: false,
        remove_empty_properties: false,
        validation_error_placement: 'below_field'
      });
      this.editor.on('change', () => onChange(this.editor.getValue()))

    } catch(err) {
      this.setState({error: err.message, hasSchema: false})
    }
  }

  render() {
    const {onSubmit} = this.props
    const {error, hasSchema} = this.state
    if (error) {
      return (
        <Alert
          message={error}
          type={'error'}
          showIcon
        />
      )
    }
    if (hasSchema) {
      return (
        <form
          ref={r => this.createEditor(r, this.jsonSchema)}
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <button type="submit" style={{ display: "none" }} />
        </form>
      );
    }
    return <Spin />
  }
}

JsonForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  setFormSubmissionListener: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
}
export default injectIntl(JsonForm)

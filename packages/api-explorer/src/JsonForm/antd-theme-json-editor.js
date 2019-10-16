/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const JSONEditor = require('@json-editor/json-editor')

const antdTheme = JSONEditor.defaults.themes.bootstrap4.extend({

  // ref: https://github.com/json-editor/json-editor/blob/master/src/themes/bootstrap4.js#L49
  getFormControl (label, input, description) {
    const labelText = label ? label.textContent : "";
    const descriptionText = description ? description.textContent : "";
    const group = document.createElement('div')

    if (label && (input.type === 'checkbox' || input.type === 'radio')) {
      group.classList.add('form-check')
      label.classList.add('form-check-label')
      input.classList.add('form-check-input')
      label.insertBefore(input, label.firstChild)
      group.appendChild(label)
    } else {
      group.classList.add('form-group')
      if (label) {
        label.classList.add('form-control-label')
        group.appendChild(label)
      }
      group.appendChild(input)
    }

    // Input Text.
    if (!input.type || input.type === 'text') { 
      input.classList.add('input-field', 'ant-input') 
    }

    if (description && labelText !== descriptionText) group.appendChild(description)

    return group
  },
  getButton (text, icon, title) {
    const el = this._super(text, icon, title)
    el.classList.add('ant-btn', 'ant-btn-primary')
    return el
  },
  getModal () {
    const el = this._super()
    el.style.background = "#fff"
    el.style.borderRadius = '4px'
    el.style.border = "none"
    el.style.marginTop = "5px"
    el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
    el.style.padding = '5px'
    el.style.position = 'absolute'
    el.style.zIndex = '10'
    el.style.display = 'none'
    el.style.fontSize = "14px"
    return el
  },
  getHeader (text) {
    const el = document.createElement('div')
    el.style.margin = '10px 0px 5px 0px'
    if (typeof text === 'string') {
      el.textContent = text
    } else {
      el.appendChild(text)
    }

    return el
  },
  getButtonHolder () {
    const el = document.createElement('div')
    el.classList.add('btn-holder-div')
    el.style.display = 'inline-flex'
    return el
  },
})

module.exports = antdTheme
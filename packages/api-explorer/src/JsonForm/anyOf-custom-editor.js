/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const Choices = require('choices.js')
require('choices.js/public/assets/styles/choices.min.css')

const errorsByType = {
  'not-compatible': 'jsonform.anyof.notCompatibleSchemas',
  'empty-selection': 'jsonform.anyof.emptySelection',
}
const unknownError = 'jsonform.anyof.unknownError'

/**
 * This module allows custom control on JSONEditor for schemas marked as 'multiple'
 * (which comprehends schemas such as anyOf).
 * For this kind of schemas we create a custom multiselect input (using Choices lib)
 * for selecting the desired request schema and change the input form accordingly.
 *
 * We listen for change events on the form submission in order to update selection or
 * to show errors when trying to use an API without previously selecting a schema.
 */
module.exports = (intl, setFormSubmissionListener, classReference) => class AnyOf extends classReference{
  build() {
    this.keep_values = false
    const response = super.build()
    const { switcher, switcherDiv }= this.buildSwitcher()
    this.switcher.replaceWith(switcherDiv)
    this.hideEditor()
    this.addErrorMessageHtmlNode()
    setFormSubmissionListener(switcher)
    return response
  }

  buildSwitcher() {
    const self = this
    const switcher = this.theme.getSwitcher(this.display_text)
    switcher.multiple = true
    switcher.selectedIndex = '-1'

    const switcherDiv = document.createElement('div')
    const switcherLabel = document.createElement('label')
    switcherLabel.style.fontWeight = 'bold'
    switcherLabel.innerText = 'Select the schemas:'
    switcherDiv.appendChild(switcherLabel)
    switcherDiv.appendChild(switcher)
    const choices = new Choices(switcher, {
      placeholder: true,
      placeholderValue: 'Select the schema',
      removeItemButton: true,
      duplicateItemsAllowed: false,
      classNames: {
        listItems: 'multiple-select-choices-list choices__list--multiple',
        item: 'multiple-select-item choices__item'
      }
    })

    /**
     * Change event is dispatched by JSONEditor on selection change, we use it to update
     * the schema used by the editor accordingly.
     */
    switcher.addEventListener('change', e => {
      e.preventDefault();
      e.stopPropagation();

      const selectedValues = Array.from(e.currentTarget.selectedOptions).map(selectedValue => selectedValue.value)
      if (selectedValues.length === 0) {
        self.showErrorMessage('empty-selection')
      } else if (selectedValues.length === 1) {
        self.hideErrorMessage()
        self.switchEditor(self.display_text.indexOf(selectedValues[0]))
      } else {
        self.updateEditor(selectedValues)
      }
      self.onChange(true)
      choices.hideDropdown()
    });

    /**
     * FormSubmission event is dispatched by APIExplorer Doc component on formsubmission for
     * listener to apply custom logics on the event.
     */
    switcher.onFormSubmission = () => {
      const {selectedOptions} = switcher
      if (!selectedOptions || selectedOptions.length === 0) {
        self.showErrorMessage('empty-selection')
        throw new Error('invalid form, user must select a schema')
      }
    }

    return { switcher, switcherDiv }
  }

  updateEditor(selectedValues) {
    const joinedValues = selectedValues.join('_')
    const mergedEditorIndex = editorIndexesMap.get(joinedValues)
    if (mergedEditorIndex) {
      this.hideErrorMessage()
      this.switchEditor(mergedEditorIndex);
      return
    }
    const schemasIndexes = selectedValues.map(value => this.display_text.indexOf(value))
    const schemas = this.types.filter((_, index) => schemasIndexes.includes(index))
    const mergedSchemas = mergeSchemas(schemas, self)
    if (!mergedSchemas) {
      this.showErrorMessage('not-compatible')
      return
    }
    this.hideErrorMessage()
    const index = this.types.length
    this.insertNewEditor(index, joinedValues, mergedSchemas)
    this.switchEditor(index)
  }

  addErrorMessageHtmlNode() {
    this.errorMessageHtmlNode = document.createElement('p')
    this.errorMessageHtmlNode.style.color = 'red'
    this.errorMessageHtmlNode.style.fontWeight = 'bold'
    this.errorMessageHtmlNode.style.display = 'none'
    this.errorMessageHtmlNode.style.marginTop = '10px'
    this.container.appendChild(this.errorMessageHtmlNode)
  }

  showErrorMessage(type) {
    this.hideEditor()
    this.errorMessageHtmlNode.innerText = intl.formatMessage({
      id: errorsByType[type] || unknownError
    })
    this.errorMessageHtmlNode.style.display = 'block'
  }

  hideErrorMessage() {
    if (this.editor_holder) {
      this.editor_holder.style.display = 'block'
    }
    this.errorMessageHtmlNode.style.display = 'none'
  }

  insertNewEditor(index, joinedValues, mergedSchemas) {
    editorIndexesMap.set(joinedValues, index)
    this.types.push(mergedSchemas)
    this.editors.push(false)
  }

  hideEditor() {
    if (this.editor_holder) {
      this.editor_holder.style.display = 'none'
    }
  }
}

const editorIndexesMap = new Map()

const extractSchemasTypeIfCompatible = (schemas) => {
  let firstValidType = ''
  for (let i = 0; i < schemas.length; i++) {
    const {type} = schemas[i]
    if (type !== 'any' && (firstValidType && type !== firstValidType)) {
      return undefined
    }
    firstValidType = type
  }
  return firstValidType
}

const getMergerByType = (type) => {
  switch (type) {
    case 'array':
      return mergeArrays
    case 'object':
      return mergeObjects
    default:
      return (_, schemasType) =>  ({ type: schemasType })
  }
}

const mergeSchemas = (schemas) => {
  const schemasType = extractSchemasTypeIfCompatible(schemas)
  if (!schemasType) {
    return
  }
  const merger = getMergerByType(schemasType)
  const mergedSchemas = merger(schemas, schemasType)
  return mergedSchemas
}

const mergeArrays = schemas => {
  const schemasItems = schemas.map(schema => schema.items)
  const mergedItems = mergeSchemas(schemasItems)
  if (!mergedItems) {
    return
  }
  return { type: 'array', items: mergedItems }
}

const mergeObjects = schemas => {
  try {
    const mergedProperties = schemas.reduce((propsAccumulator, currentSchema) => {
      const { properties } = currentSchema
      Object.keys(properties).forEach(currentProperty => {
        if (!propsAccumulator[currentProperty]) {
          propsAccumulator[currentProperty] = properties[currentProperty]
          return propsAccumulator
        }
        propsAccumulator[currentProperty] = mergeSchemas([propsAccumulator[currentProperty], properties[currentProperty]])
        if (!propsAccumulator[currentProperty]) {
          throw Error(`Failed to merge schemas of property ${currentProperty}`)
        }
      })
      return propsAccumulator
    }, {})

    return {
      type: 'object',
      properties: mergedProperties,
    }
  } catch (error) {
    return undefined
  }
}

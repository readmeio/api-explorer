import it from '../../i18n/it.json'

import antdTheme from "./antd-theme-json-editor";
import notCustomEditor from "./not-custom-editor";
import anyOfEditor from "./anyOf-custom-editor";
import objectsEditor from "./objects-editor";

function setDefaultCustomization (JSONEditor) {
  const editorsKeys = Object.keys(JSONEditor.defaults.editors)

  editorsKeys.forEach(key => {
    JSONEditor.defaults.editors[key] = class Customization extends JSONEditor.defaults.editors[key] {
      postBuild() {
        super.postBuild()

        if (this.editjson_control) {
          this.editjson_control.classList.add('ant-btn-sm')
          this.editjson_control.style.margin = '0px 8px'
          this.editjson_control.style.borderRadius = '4px'
        }

        if (this.addproperty_button) {
          this.addproperty_button.classList.add('ant-btn-sm')
          this.addproperty_button.style.margin = '0px 8px'
          this.addproperty_button.style.borderRadius = '4px'
        }

        if (this.collapse_control) {
          this.collapse_control.classList.add('ant-btn-sm')
        }

        if (this.toggle_button) {
          this.toggle_button.classList.add('ant-btn-sm')
        }

        if (this.container !== undefined && this.title !== undefined) {
          const classContainer = (key === 'upload' || key === 'base64') ? 'mia-container-upload-file-wrapper' : 'mia-container-wrapper' 
          this.container.classList.add(classContainer)
        }
      }
    }
  });
}
module.exports = function configureJSONEditor(JSONEditor, intl, setFormSubmissionListener) {
  JSONEditor.defaults.languages.it = it
  JSONEditor.defaults.language = intl.locale

  JSONEditor.defaults.themes.antdTheme = antdTheme(JSONEditor)

  setDefaultCustomization(JSONEditor)

  JSONEditor.defaults.editors.not = notCustomEditor(JSONEditor.defaults.editors.multiple)
  JSONEditor.defaults.editors.anyOf = anyOfEditor(intl, setFormSubmissionListener, JSONEditor.defaults.editors.multiple)
  JSONEditor.defaults.editors.object = objectsEditor(JSONEditor.defaults.editors.object)
  // eslint-disable-next-line consistent-return
  JSONEditor.defaults.resolvers.unshift((scheme) => {
    // If the schema can be of any type
    if (
      (scheme.type === "string" &&
        scheme.media &&
        scheme.media.binaryEncoding === "base64") ||
      scheme.format === "binary"
    ) {
      return "base64";
    }
  });

  // eslint-disable-next-line consistent-return
  JSONEditor.defaults.resolvers.unshift((scheme) => {
    if (scheme.not && scheme.not.type) {
      return 'not'
    }
  })

  // eslint-disable-next-line consistent-return
  JSONEditor.defaults.resolvers.unshift((scheme) => {
    if (scheme.anyOf) {
      return 'anyOf'
    }
  })
}

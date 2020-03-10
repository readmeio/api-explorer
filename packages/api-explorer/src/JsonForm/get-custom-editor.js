/* eslint-disable no-underscore-dangle */
import JSONEditor from "@json-editor/json-editor";

const getCustomEditor = key =>{
  return JSONEditor.defaults.editors[key].extend({
    setContainer(container) {
      this.container = container;
      this.container.style.paddingTop = "5px";
      this._super(this.container)
    },
    build() {
      // key (the schema typology) is set to multiple when it's
      // anyOf or similar, jsoneditor uses multiple for some of
      // these kind of schemas, in case the current key is multiple
      // during schema change we want the editor to be cleared out.
      if (key === 'multiple') {
        this.keep_values = false
      }
      const buildResponse = this._super()
      if(this.addproperty_add) {
        this.addproperty_add.style.marginLeft = '10px'
      }
      return buildResponse
    }
  });

}
module.exports = getCustomEditor;

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
      const buildResponse = this._super()
      if(this.addproperty_add) {
        this.addproperty_add.style.marginLeft = '10px'
      }
      return buildResponse
    }
  });

}
module.exports = getCustomEditor;

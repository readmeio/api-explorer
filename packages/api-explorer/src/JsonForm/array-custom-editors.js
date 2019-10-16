/* eslint-disable no-underscore-dangle */
const baseArrayCustomEditor = require('./get-custom-editor')

function setControlsStyle(controls) {
  if(controls) {
    controls.style.display = 'grid'
    controls.style.gridTemplateColumns = 'repeat(3, min-content)'
    controls.style.gridGap = '10px'
  }
}
module.exports = () => baseArrayCustomEditor('array').extend({
  addControls(){
    const response = this._super()
    setControlsStyle(this.controls)
    return response
  },
  refreshValue(force) {
    const response = this._super(force)
    if (this.controls) {
      const currentStyle = this.controls.style.display
      if (currentStyle && currentStyle !== 'none'){
        setControlsStyle(this.controls)
      }
    }
    return response
  }
})

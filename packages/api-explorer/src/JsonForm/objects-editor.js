module.exports = (classReference) => class objectCustomEditor extends classReference {

  postBuild() {
    super.postBuild()

    this.editjson_control.classList.remove('ant-btn-primary')
    this.editjson_control.classList.add('ant-btn-sm', 'ant-btn')
    
    this.addproperty_button.classList.remove('ant-btn-primary')
    this.addproperty_button.classList.add('ant-btn-sm', 'ant-btn')
    
    this.collapse_control.classList.remove('ant-btn-primary')
    this.collapse_control.classList.add('ant-btn-sm', 'ant-btn')
    this.collapse_control.style.border = '0px'
    this.collapse_control.style.background = 'transparent'

    this.controls.style.float = 'right'
    this.controls.style.margin = '5px 0px 0px 10px'

    if (this.editjson_textarea) {
      this.editjson_textarea.style.resize = 'both'
    }
  }
}

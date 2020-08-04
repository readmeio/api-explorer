module.exports = (classReference) => class objectCustomEditor extends classReference {

  showEditJSON(){
    super.showEditJSON()
    if (this.schema.id === 'root' && this.editor_holder && this.editjson_card_holder && this.editjson_holder && this.editjson_textarea) {
      this.editjson_holder.style.display = 'none'
      this.editor_holder.style.display = 'none'
      this.editjson_card_holder.style.display = 'block'
      this.editjson_textarea.style.width = `100%`
      this.editjson_textarea.style.height = '500px'
      this.editjson_textarea.style.resize = 'vertical'
      this.editjson_textarea.style.fontFamily = 'monospace'
    } 
    if (this.schema.id !== 'root' && this.editjson_holder && this.editjson_textarea && this.editjson_control) {
      const outsideClickListener = event => {
        if (!this.editjson_holder.contains(event.target) && this.editjson_holder.style.display !== 'none') {
          this.hideEditJSON()
        }
      }
      const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener)
      }
      this.removeListener = removeClickListener
      document.addEventListener('click', outsideClickListener)
      this.editjson_textarea.style.width = '450px'
      this.editjson_textarea.style.height = '340px'
      this.editjson_textarea.style.fontFamily = 'monospace'
      const leftSize = parseInt(this.editjson_holder.style.left, 10) - this.editjson_holder.offsetWidth - parseInt(this.editjson_control.style.marginLeft, 10)
      if(leftSize && typeof leftSize === 'number' && !isNaN(leftSize)){
        this.editjson_holder.style.left = `${leftSize}px`
      }
      this.editjson_holder.style.top = `-104px`
      this.editjson_holder.style.display = ''
    }
  }
  hideEditJSON(){
    super.hideEditJSON()
    if(this.removeListener !== undefined){
      this.removeListener()
      this.removeListener = undefined
    }
    if (this.schema.id === 'root' && this.editor_holder && this.editjson_card_holder) {
      this.editor_holder.style.display = ''
      this.editjson_card_holder.style.display = 'none'
    }
  }

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

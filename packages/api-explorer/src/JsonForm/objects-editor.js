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
      this.collapsed = false
      this.setButtonText(this.collapse_control, '', 'collapse', this.translate('button_collapse'))
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

    this.title.removeChild(this.collapse_control)
    this.collapse_control = this.getButton('', 'collapse', this.translate('button_collapse'))
    this.collapse_control.style.margin = '0 10px 0 0'
    this.collapse_control.classList.add('json-editor-btntype-toggle')
    this.collapse_control.classList.remove('ant-btn-primary')
    this.collapse_control.classList.add('ant-btn-sm', 'ant-btn')
    this.collapse_control.style.border = '0px'
    this.collapse_control.style.background = 'transparent'
    this.title.insertBefore(this.collapse_control, this.title.childNodes[0])
    this.collapse_control.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (this.collapsed) {
        if (this.editor_holder) {
          this.editor_holder.style.display = ''
        }

        this.collapsed = false
        this.setButtonText(this.collapse_control, '', 'collapse', this.translate('button_collapse'))
      } else {
        this.hideEditJSON()
        if (this.editor_holder) {
          this.editor_holder.style.display = 'none'
        }

        if (this.editjson_card_holder) {
          this.editjson_card_holder.style.display = 'none'
        }

        this.collapsed = true
        this.setButtonText(this.collapse_control, '', 'expand', this.translate('button_expand'))
      }
    })

    this.controls.style.float = 'right'
    this.controls.style.margin = '5px 0px 0px 10px'

    if (this.editjson_textarea) {
      this.editjson_textarea.style.resize = 'both'
    }
  }
}

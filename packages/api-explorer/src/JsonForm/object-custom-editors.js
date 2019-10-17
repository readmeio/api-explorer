/* eslint-disable no-underscore-dangle */
const baseObjectCustomEditor = require('./get-custom-editor')

module.exports = () => baseObjectCustomEditor('object').extend({
  build() {
    const response = this._super()
    this.editjson_holder.innerHTML = ''
    const textArea = this.editjson_textarea
    const saveBtt = this.editjson_save
    const copyBtt = this.editjson_copy
    const cancelBtt = this.editjson_cancel
    
    const container = document.createElement('div')

    const textAreaHolder = document.createElement('div')
    textArea.style.resize = 'both'
    textArea.style.margin = '0px'
    textArea.style.minWidth = '350px'
    textArea.style.minHeight = '300px'
    
    textAreaHolder.appendChild(textArea)

    const buttonHolder = document.createElement('div')
    buttonHolder.style.display = 'grid'
    buttonHolder.style.gridTemplateColumns = 'repeat(3, min-content)'
    buttonHolder.style.gridGap = '10px'
    buttonHolder.style.padding = '5px'

    buttonHolder.appendChild(saveBtt)
    buttonHolder.appendChild(copyBtt)
    buttonHolder.appendChild(cancelBtt)

    container.appendChild(textAreaHolder)
    container.appendChild(buttonHolder)
    
    this.editjson_holder.appendChild(container)
    return response
  }
})

/* eslint-disable no-underscore-dangle */
const baseCustomEditor = require('./get-custom-editor')

const isArrayWithItems = schema => schema.type === 'array' && schema.items
const isObjectWithProps = schema => schema.type === 'object' && schema.properties

module.exports = () => baseCustomEditor('multiple').extend({
  preBuild() {
    const { not: notSchema } = this.schema

    if (!isArrayWithItems(notSchema) && !isObjectWithProps(notSchema)) {
      this.schema.disallow = [this.schema.not.type]    
    }
    
    delete this.schema.not
    return this._super()
  }
})

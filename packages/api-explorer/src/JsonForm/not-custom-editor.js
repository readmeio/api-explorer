/* eslint-disable no-underscore-dangle */
const isArrayWithItems = schema => schema.type === 'array' && schema.items
const isObjectWithProps = schema => schema.type === 'object' && schema.properties

module.exports = (classReference) => class notCustomEditor extends classReference {
  build() {
    this.keep_values = false
    super.build()
  }

  preBuild() {
    const { not: notSchema } = this.schema
    if (!isArrayWithItems(notSchema) && !isObjectWithProps(notSchema)) {
      this.schema.disallow = [this.schema.not.type]
    }

    delete this.schema.not
    super.preBuild()
  }
}

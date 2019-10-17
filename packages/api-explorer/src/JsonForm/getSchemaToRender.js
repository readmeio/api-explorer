import get from 'lodash.get'

// Set a white-space title to prevent JsonEditor to set "root" title before the form
const TITLE = " "

/**
 * Convert the json-schema to a json-schema supported from the JsonEditor.
 * Set an empty title and resolve the $ref on the root of the schema if it exists, because it is an invalid json-schema,
 * but due to retrocompatibility we have to support it.
 * 
 * Reference: https://github.com/json-schema-org/json-schema-spec/issues/479
 */
export default function getSchemaToRender(schema){
  const withoutTitle = {...schema, title: TITLE}
  const ref = withoutTitle.$ref
  if(!ref) {
    return withoutTitle
  }
  // e.g.:    "#/components/schemas/Pet" -> ".components.schemas.Pet"
  const componentsPath = ref.slice(1, ref.length).replace(/\//g, '.')
  const foundReference = get(schema, `definitions${componentsPath}`)
  if(!foundReference) {
    return withoutTitle
  }
  return {
    ...withoutTitle,
    '$ref': undefined,
    ...foundReference
  }
}
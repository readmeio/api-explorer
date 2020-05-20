import get from 'lodash.get'
import {omit} from 'ramda'

const MAX_RECURSION_COUNT = 8

export default function resolveRootRef(schema, count = 0) {
  if (count === MAX_RECURSION_COUNT) {
    throw new Error('circular reference')
  }

  const ref = schema.$ref
  if(!ref) {
    return schema
  }

  // e.g.: "#/components/schemas/Pet" -> "components.schemas.Pet"
  const componentsPath = ref.slice(2, ref.length).replace(/\//g, '.')
  const foundReference = get(schema, componentsPath)

  if(!foundReference) {
    throw new Error('missing reference')
  }

  return resolveRootRef({
    ...omit(['$ref'], schema),
    ...foundReference
  }, count + 1)
}
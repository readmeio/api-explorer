/*
 * Copyright © 2019-present Mia s.r.l.
 * All rights reserved
 */

const isSchemaUsable = schema => schema && Object.keys(schema).length > 0

export function isRequired(key, schema) {
  if (!isSchemaUsable(schema)) {
    return false
  }

  if (Array.isArray(schema.required) && schema.required.includes(key)) {
    return true
  }

  return false
}

const getSubSchema = (key, schema) => {
  if (!isSchemaUsable(schema)) {
    return {}
  }

  if (schema.type === 'object' && schema.properties && schema.properties[key] && (schema.properties[key].type === 'object' || schema.properties[key].type === 'array')) {
    return schema.properties[key]
  }

  return schema
}

const allUndefined = o => Object.values(o).map(v => v !== undefined).length <= 0
const shouldRecurse = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 
const shouldDelete = (v) => typeof v !== "string" && typeof v !== "boolean" && typeof v !== "number" && (v === null || v === undefined || Object.keys(v).length <= 0 || allUndefined(v))

const removeEmpty = (obj, schema) => {
  Object.keys(obj).forEach(key => {
    const subSchema = getSubSchema(key, schema)
    if (Array.isArray(obj[key])) {
      obj[key].forEach(v => v && removeEmpty(v, subSchema))
    } 

    if (shouldRecurse(obj[key])) removeEmpty(obj[key], subSchema)
    if (shouldDelete(obj[key]) && !isRequired(key, schema)) delete obj[key]
  });
  return obj
}


export default function filterEmptyFormData(formDataChange, formDataSchema) {
  if (!formDataChange) {
    return formDataChange
  }
  return removeEmpty(formDataChange, formDataSchema)
}

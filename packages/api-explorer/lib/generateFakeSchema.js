import jsf from "json-schema-faker"

jsf.option({
  failOnInvalidTypes: false,
  failOnInvalidFormat: false,
  useDefaultValue: true,
  useExamplesValue: true,
  alwaysFakeOptionals: true,
})

function generateObjectExample(example, properties) {
  const generatedExample = properties ? jsf.generate(properties) : {}
  for (const key in example) {
    generatedExample[key] = generateExampleFromType(example[key], example[key])
  }
  return generatedExample
}

function generateArrayExample(example) {
  return example.map(item => generateExampleFromType(item, item))
}

function generateExampleFromType (example, schema) {
  if(Array.isArray(example)) {
    return generateArrayExample(example)
  }
  if (example !== null && !Array.isArray(example) && typeof example === 'object') {
    return generateObjectExample(example, schema.properties)
  }
  return example
}

jsf.define('example', (example, schema) => {
  return generateExampleFromType(example, schema)
})

export default function generateFakeSchema(schema) {
  return jsf.generate(schema)
}

// eslint-disable-next-line no-undef
const jsf = jest.genMockFromModule('json-schema-faker')

let generate
// eslint-disable-next-line no-underscore-dangle
jsf._generateReturnValue = (value) => {
  generate = value
}

// eslint-disable-next-line no-undef
jsf.generate = jest.fn(() => {
  return generate()
})

export default jsf

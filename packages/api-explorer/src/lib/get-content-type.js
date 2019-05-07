module.exports = (operation) => {
    return (operation &&
      operation.requestBody &&
      operation.requestBody.content &&
      Object.keys(operation.requestBody.content)) || []
  }
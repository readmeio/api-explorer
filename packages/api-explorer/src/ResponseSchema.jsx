const React = require('react')
const PropTypes = require('prop-types')
const _ = require('lodash')

const Oas = require('./lib/Oas')
const marked = require('../../markdown/index')
const findSchemaDefinition = require('./lib/find-schema-definition');

const { Operation } = Oas

// const convertToParams = require('../../../legacy-stuff/swagger');

class ResponseSchema extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedStatus: Object.keys(props.operation.responses || {})[0],
      oas: props.oas
    }
    this.selectedStatus = this.selectedStatus.bind(this)
    this.changeHandler = this.changeHandler.bind(this)
  }

  selectedStatus (selected) {
    this.setState({ selectedStatus: selected });
  }

  changeHandler (e) {
    this.selectedStatus(e.target.value)
  }

  // TODO https://github.com/readmeio/api-explorer/issues/43
  renderSchema (operation) {
    let schema
    const oas = this.state.oas
    if(!this.validateOperation(operation, this.state.selectedStatus)) return

    if (operation.responses[this.state.selectedStatus].content) {
      if (
        operation.responses[this.state.selectedStatus].content['application/json'].schema.type ===
          'object' &&
        operation.responses[this.state.selectedStatus].content['application/json'].schema
          .properties
      ) {
        schema =
          operation.responses[this.state.selectedStatus].content['application/json']
      }
    }
    else if (
      operation.responses[this.state.selectedStatus].content['application/xml'].schema.type ===
        'object' &&
      operation.responses[this.state.selectedStatus].content['application/xml'].schema.properties
    ) {
      schema =
        operation.responses[this.state.selectedStatus].content['application/xml']
    }
    if(operation.responses[this.state.selectedStatus].content &&
      operation.responses[this.state.selectedStatus].content['application/json'].schema &&
      operation.responses[this.state.selectedStatus].content['application/json'].schema.$ref
    ){
      schema = {
        schema: findSchemaDefinition(operation.responses[this.state.selectedStatus].content['application/json'].schema.$ref, oas)
      }
    }
    return schema && (
      <table>
        {this.convertToParams([schema], 'response').map((param, index) => {
          return (<tr key={index}>
            <th>{param.name}</th>
            <td>
              {param.type}
              {param.description && marked(param.description)}
            </td>
          </tr>)
        })}
      </table>
    )
  }

  convertBodyToParams (params, isChild, parent, stack = 0) {
    let paramsOut = []
    const oas = this.state.oas
    _.each(isChild ? params : params[0].schema.properties, (p, k) => {
      // if (p.readOnly) return // These only show up in responses
      if(p.$ref){
        p = findSchemaDefinition(p.$ref, oas)
      }

      const param = _.clone(p)
      param.name = (isChild ? `${isChild}.` : '') + k

      paramsOut.push(param)
      if (_.isUndefined(param.required)) {
        if (isChild) { // I don't know if it should only be root elements... but for now, why not
          param.required = parent.required && parent.required.includes(k)
        } else if (!parent) {
          param.required = params[0].schema.required && params[0].schema.required.indexOf(param.name) >= 0
        }
      }

      if (p.type === 'object' && stack < 3) {
        paramsOut = paramsOut.concat(this.convertBodyToParams(p.properties, param.name, p, stack + 1))
      }
    })

    return paramsOut
  }

  renderHeader () {
    const keys = Object.keys(this.props.operation.responses)

    return (
      <h3>
        <div className='pull-right'>
          <select
            className='switcher-switch'
            value={this.state.selectedStatus}
            onChange={this.changeHandler}
          >
            {keys.map(status => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        Response
      </h3>
    )
  }

  render () {
    const { operation } = this.props
    if (!operation.responses || Object.keys(operation.responses).length === 0) return null

    return (
      <div className='hub-reference-response-definitions'>
        {this.renderHeader()}
        <div>
          {operation.responses[this.state.selectedStatus].description && (
            <p className='desc'>{operation.responses[this.state.selectedStatus].description}</p>
          )}
          {this.renderSchema(operation)}
        </div>
      </div>
    )
  }


  convertToParams (params, paramIn) {
    // if (paramIn !== 'body' && paramIn !== 'response') {
    //   return convertOtherToParams(params)
    // }
    return this.convertBodyToParams(params)
  }

  validateOperation(operation, status){
    return operation && operation.responses && operation.responses[status]
      && operation.responses[status].content
  }


}

// function convertOtherToParams (params, parent) {
//   let paramsOut = []
//   _.each(params, (p, k) => {
//     if (p.readOnly) return // These only show up in responses
//     const param = _.clone(p)
//     param.name = parent ? `${parent.name}.${k}` : `${p.name}`
//     paramsOut.push(param)
//
//     if (p.type === 'object') {
//       paramsOut = paramsOut.concat(exports.convertOtherToParams(p.properties, p))
//     }
//   })
//
//   return paramsOut
// };


ResponseSchema.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
  oas: PropTypes.instanceOf(Oas).isRequired
}

module.exports = ResponseSchema

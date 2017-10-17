const React = require('react');
const PropTypes = require('prop-types');
const Oas = require('./lib/Oas');

const { Operation } = Oas;
// const marked = require('./lib/markdown/index');
// const convertToParams = require('../../../legacy-stuff/swagger');

class ResponseSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: Object.keys(this.props.operation.responses)[0],
    };
    this.selectedStatus = this.selectedStatus.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }
  selectedStatus(selected) {
    this.setState({ selectedStatus: selected });
  }

  changeHandler(e) {
    this.selectedStatus(e.target.value);
  }

  render() {
    const { operation } = this.props;
    const keys = Object.keys(operation.responses);
    return (
      <div className="hub-reference-response-definitions">
        <h3>
          <div className="pull-right">
            <select
              className="switcher-switch"
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
        <div switcher={status}>
          {operation.responses[this.state.selectedStatus].description && (
            <p className="desc">{operation.responses[this.state.selectedStatus].description}</p>
          )}
        </div>
      </div>
    );
  }
}

// function ResponseSchema(operation) {
//   const responseArray = [];
//   const obj = {};
//   const keys = Object.keys(operation.operation.responses);
//   keys.forEach(key => {
//     obj[key] = operation.operation.responses[key];
//   });
//   responseArray.push(obj);
//
//   console.log(responseArray);
//   return (
//     <div className="hub-reference-response-definitions">
//       <h3>
//         <div className="pull-right">
//           <select className="switcher-switch">
//             {keys.map((status, i) => (
//               // eslint-disable-next-line react/no-array-index-key
//               <option value={status} key={i}>
//                 {status}
//               </option>
//             ))}
//           </select>
//         </div>
//         Response
//       </h3>
//       {responseArray.map((resObj, i) => (
//         <div switcher={status}>
//           {resObj &&
//             <p className="desc">{resObj[status]}</p>
//         //     (
//         //     response.schema && response.schema.type === 'object' && response.schema.properties,
//         //   ) && (
//         //     <table>
//         //       {swaggerUtils.convertToParams([response], 'response').forEach(param => {
//         //         <tr>
//         //           <th>param.name</th>
//         //           <td>
//         //             param.type
//         //             {param.description && marked(param.description)}
//         //           </td>
//         //         </tr>;
//         //       })}
//         //     </table>
//         //   )
//         }
//         </div>
//       ))}
//     </div>
//   );
// }

ResponseSchema.PropTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
};

module.exports = ResponseSchema;

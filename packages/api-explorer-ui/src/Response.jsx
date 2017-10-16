const React = require('react');
const PropTypes = require('prop-types');
const Oas = require('./lib/Oas');

const { Operation } = Oas;
// const marked = require('./lib/markdown/index');
// const convertToParams = require('../../../legacy-stuff/swagger');
const responseArray = [];
const obj = {};
let defaultKey;

class ResponseSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: defaultKey,
    };
    this.selectedStatus = this.selectedStatus.bind(this);
  }
  selectedStatus(selected) {
    this.setState({ selectedStatus: selected });
  }
  render() {
    const { operation } = this.props;
    // console.log(operation.responses);
    const keys = Object.keys(operation.responses);
    defaultKey = keys[0];
    keys.forEach(key => {
      responseArray.push((obj[key] = operation.responses[key]));
    });
    return (
      <div className="hub-reference-response-definitions">
        <h3>
          <div className="pull-right">
            <select className="switcher-switch">
              {keys.map((status, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <option value={status} key={i}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          Response
        </h3>
        {responseArray.map((resObj, i) => (
          <div switcher={status}>
            {resObj && <p className="desc">{resObj[this.state.selectedStatus]}</p>
            // (
            // response.schema && response.schema.type === 'object' && response.schema.properties,
            // ) && (
            // <table>
            //   {swaggerUtils.convertToParams([response], 'response').forEach(param => {
            //     <tr>
            //       <th>param.name</th>
            //       <td>
            //         param.type
            //         {param.description && marked(param.description)}
            //       </td>
            //     </tr>;
            //   })}
            // </table>
            // )
            }
          </div>
        ))}
      </div>
    );
  }
}

// function ResponseSchema(operation) {
//   const responseArray = [];
//   const obj = {};
//   const keys = Object.keys(operation.operation.responses);
//   keys.forEach(key => {
//     responseArray.push((obj[key] = operation.operation.responses[key]));
//   });
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
//         <div switcher={status} style={i === 0 ? '' : 'display:none'}>
//           {resObj && <p className="desc">{resObj[status]}</p>
//           // (
//           // response.schema && response.schema.type === 'object' && response.schema.properties,
//           // ) && (
//           // <table>
//           //   {swaggerUtils.convertToParams([response], 'response').forEach(param => {
//           //     <tr>
//           //       <th>param.name</th>
//           //       <td>
//           //         param.type
//           //         {param.description && marked(param.description)}
//           //       </td>
//           //     </tr>;
//           //   })}
//           // </table>
//           // )
//           }
//         </div>
//       ))}
//     </div>
//   );
// }

ResponseSchema.PropTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
};

module.exports = ResponseSchema;

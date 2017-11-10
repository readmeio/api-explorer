const React = require('react');
const PropTypes = require('prop-types');
const marked = require('./lib/markdown/index');

// const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

// function ResponseSchemaBody(obj) {
//   let objName;
//   console.log(obj);
//   const rows = [];
//   function recurse(obj, key) {
//     if (typeof obj[key] !== 'object') {
//       if (obj.type) {
//         rows.push(
//           <tr>
//             <th>{objName}</th>
//             <td>
//               {obj.type}
//               {obj.description && marked(obj.description)}
//             </td>
//           </tr>,
//         );
//       }
//     } else {
//       for (const childKey in obj[key]) {
//         objName = key;
//         recurse(obj[key], childKey);
//       }
//     }
//   }
//   for (const key in obj) {
//     recurse(obj, key);
//   }
//   return <table>{rows}</table>;
// }

function ResponseSchemaBody(obj) {
  let objName = '';
  const notAllowed = ['xml', 'obj', 'example', 'format', 'description'];

  console.log(obj);

  const rows = [];
  function recurse(smallerObj, key) {
    // console.log(obj);
    if (typeof smallerObj[key] !== 'object') {
      if (smallerObj.type && objName !== '') {
        rows.push(
          <tr>
            <th>{objName}</th>
            <td>
              {smallerObj.type}
              {smallerObj.description && marked(smallerObj.description)}
            </td>
          </tr>,
        );
      }
    } else {
      for (const childKey in smallerObj[key]) {
        // console.log(obj.obj[objName]);
        const path = obj.obj[objName];
        console.log(path);
        if (notAllowed.indexOf(key) === -1 && path) {
          if (path[key] === undefined) {
            objName = '';
          } else {
            objName = `${objName}.${key}`;
          }
        } else if (notAllowed.indexOf(key) === -1) {
          objName = key;
        }
        recurse(smallerObj[key], childKey);
      }
    }
  }
  for (const key in obj) {
    recurse(obj, key);
  }
  return <table>{rows}</table>;
}

module.exports = ResponseSchemaBody;

// ResponseSchemaBody.propTypes = {
//   obj: PropTypes.shape({}).isRequired,
// };

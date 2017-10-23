// exports.replaceVars = function(out, variables) {
//   // If no variables (either from default or jwt, don't change anything)
//   if (!variables) {
//     return out;
//   }
//
//   // Variables will initially be string
//   if (typeof variables === 'string') {
//     try {
//       variables = JSON.parse(variables);
//     } catch (e) {
//       // TODO-JWT Try to figure out a way to deal with error
//       console.log(e);
//     }
//   }
//
//   out = out.replace(/&lt;&lt;([-\w:]*?)&gt;&gt;/g, (match, v) => {
//     const type = v.indexOf('keys:') >= 0 ? 'keys' : 'user';
//
//     if (type === 'keys') {
//       const vName = v.split(':')[1];
//       if (variables.default) {
//         for (const keyVar of variables.keys) {
//           if (keyVar.name === vName) {
//             return `<variable-keys v=${v} data="${keyVar.default}" isdefault='true'></variable-keys>`;
//           }
//         }
//       } else if (variables.fromReadmeKey) {
//         return `<variable-keys v=${v} data="${vName.toUpperCase()}" isdefault='true'></variable-keys>`;
//       }
//
//       // Directive handles replacing key variables and showing switcher ui
//       return `<variable-keys v=${v} data="${vName.toUpperCase()}"></variable-keys>`;
//     } else if (variables.default) {
//       for (const userVar of variables.user) {
//         if (userVar.name === v) {
//           return `<variable v=${v} data="${userVar.default}" isdefault='true'></variable>`;
//         }
//       }
//
//       // Fallback to uppercase if there is no default
//       return `<variable v=${v} data="${v.toUpperCase()}" isdefault='true'></variable>`;
//     } else if (variables[v]) {
//       return `<variable v=${v} data="${variables[v]}"></variable>`;
//     }
//     return `<variable v=${v}></variable>`;
//   });
//
//   // Makes \<<variable\>> display as <<variable>> in the frontend
//   out = out.replace(/\\&lt;&lt;([-\w:]*?)\\&gt;&gt;/g, (match, v) => `&lt;&lt;${v}&gt;&gt;`);
//
//   return out;
// };

const ReactDOM = require('react-dom');

function Version({ version }) {
  return ReactDOM.createPortal(`v${version}`, document.getElementById('oas-version'));
}

module.exports = Version;

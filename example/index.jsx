/* eslint-disable */
const React = require("react");
const ReactDOM = require("react-dom");
const SlateEditor = require("./editor").default;

function render(Component) {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('hub-content'),
  );
}

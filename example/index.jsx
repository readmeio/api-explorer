const React = require('react');
const ReactDOM = require('react-dom');
const { AppContainer } = require('react-hot-loader');

function render(Component) {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('hub-content'),
  );
}

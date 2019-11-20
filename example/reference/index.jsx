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

render(require('./src/Preview'));

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./src/Preview', () => render(require('./src/Preview'))); // eslint-disable-line global-require
}

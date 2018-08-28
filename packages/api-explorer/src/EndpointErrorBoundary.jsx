const React = require('react');
const PropTypes = require('prop-types');

class EndpointErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // TODO add bugsnag here?
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="hub-reference-section">
          <div className="hub-reference-left" style={{ paddingLeft: '2%' }}>
            <h3>There was an error rendering this endpoint. Please contact <a href="mailto:support@readme.io?subject=API Explorer Error">support@readme.io</a> with the following error:</h3>
            <pre>
              {this.state.error && this.state.error.toString()}
              {this.state.info.componentStack}
            </pre>
          </div>
          <div className="hub-reference-right" />
        </div>
      )
    }
    return this.props.children;
  }
}

EndpointErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}

module.exports = EndpointErrorBoundary;

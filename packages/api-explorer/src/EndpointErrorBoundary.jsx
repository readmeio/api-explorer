const React = require('react');
const PropTypes = require('prop-types');

const BoundaryStackTrace = require('./BoundaryStackTrace');

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
      const mailTo = (
        <a href="mailto:support@readme.io?subject=API Explorer Error">support@readme.io</a>
      );

      return (
        <div className="hub-reference-section">
          <div className="hub-reference-left" style={{ paddingLeft: '2%' }}>
            <h3>
              There was an error rendering this endpoint. If you are the owner of this project
              please contact
              {` ${mailTo} with the following error:`}
            </h3>
            <BoundaryStackTrace error={this.state.error} info={this.state.info} />
          </div>
          <div className="hub-reference-right" />
        </div>
      );
    }

    return this.props.children;
  }
}

EndpointErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

module.exports = EndpointErrorBoundary;

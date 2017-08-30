const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const SecurityInput = require('./SecurityInput');

function renderSecurities(oas, path, method) {
  const securityTypes = oas.prepareSecurity(path, method);
  return Object.keys(securityTypes).map((type) => {
    const securities = securityTypes[type];
    return (
      <span key={type}>
        <h3>{type} Auth</h3>
        <div className="pad">
          <section>
            {
              // https://github.com/readmeio/api-explorer/issues/20
              // (type === 'OAuth2' && securities.length > 1) && (
              //   <select>
              //     {
              //       securities.map(security =>
              //         <option key={security._key} value={security._key}>{security._key}</option>,
              //       )
              //     }
              //   </select>
              // )
            }
            {
              securities.map(security => (
                <SecurityInput
                  key={security._key}
                  scheme={security}
                  apiKey=""
                />),
              )
            }
          </section>
        </div>
      </span>
    );
  });
}

class AuthBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };

    this.toggle = this.toggle.bind(this);
  }
  toggle(e) {
    e.preventDefault();
    this.setState({ open: !this.state.open });
  }
  render() {
    const { oas, path, method } = this.props;

    if (!oas.hasAuth(path, method)) return null;

    return (
      <div className={classNames('hub-auth-dropdown', 'simple-dropdown', { open: this.state.open })}>
        <a href="" className="icon icon-user-lock" onClick={this.toggle} />
        <div className="nopad">
          <div className="triangle" />
          <div>{ renderSecurities(oas, path, method) }</div>
        </div>
      </div>
    );
  }

  // .hub-auth-dropdown()
  //   a.icon.icon-user-lock(href="" ng-click="toggle()")
  //   div.nopad
  //     div
  //       each securities, type in swaggerUtils.prepareSecurity(swagger)
  //         h3 #{type} Auth
  //         .pad
  //           section
  //             - var multipleOauths = type === 'OAuth2' && securities.length > 1
  //             if multipleOauths
  //               select(ng-model="oauth2_show" ng-init="oauth2_show = oauth2_show || '"+securities[0]._key+"'")
  //                 each security, security_name in securities
  //                   option(value=security._key)= security._key
  //             each security in securities
  //               +securityInput(security, multipleOauths)

  //       .hub-authrequired(ng-class="{active: results.needsAuth}")
  //         .hub-authrequired-slider
  //           i.icon.icon-notification &nbsp;
  //           | Authentication is required for this endpoint.

}

AuthBox.propTypes = {
  oas: PropTypes.shape({}).isRequired,
  path: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
};

module.exports = AuthBox;

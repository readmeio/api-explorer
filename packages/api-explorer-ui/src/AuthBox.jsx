const React = require('react');
const PropTypes = require('prop-types');

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
              (type === 'OAuth2' && securities.length > 1) && (
                <select>
                  { securities.map(security => <option key={security._key} value={security._key}>{security._key}</option>) }
                </select>
              )
            }
          </section>
        </div>
      </span>
    );
  });
}

function toggle() {}

function AuthBox({ oas, path, method }) {
  if (!oas.hasAuth(path, method)) return null;

  return (
    <div className="hub-auth-dropdown" simple-dropdown="isAuthOpen">
      <a href="" className="icon icon-user-lock" onClick={toggle}></a>
      <div className="nopad">
        <div>{ renderSecurities(oas, path, method) }</div>
      </div>
    </div>
  );


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

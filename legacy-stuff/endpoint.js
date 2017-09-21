import 'angular-cookies';
import getParamEndpointValue from '../lib/get-param-endpoint-value';
import configureSecurity from '../lib/configure-security';
import extensions from '../packages/readme-oas-extensions';

/*
 * This takes care of try it now, code snippets, etc
*/

const app = angular.module('rm.endpoint', ['ngCookies']);

app.controller('Endpoint', ($scope, $rootScope, $timeout, $http, user, version, apiAuth, $cookies, $window) => {
  // This is a controller rather than a directive because we couldn't create
  // an isolated scope with the directive... and things were leaking. A controller
  // is bad because we're manipulating the DOM a few times, but overall it mostly works.

  $scope.hasOauthUrl = () => $rootScope.meta.oauth === 'true';

  $scope.apiAuth = apiAuth;
  $scope.user = user;

  $scope.selected = window.localStorage.selected_app ? window.localStorage.selected_app : 0;

  $scope.getOauthUrl = `/oauth?redirect=${$window.location.pathname}`;

  const setupJS = ($el) => {
    $el.on('click', '.tabber-tab', (e) => {
      setTab($(e.currentTarget));
      return false;
    });
  };

  let $el;
  $scope.setSlug = function (slug) {
    $scope.slug = slug;
    $el = $(`#page-${$scope.slug}`);

    setupJS($el);
  };

  $scope.isAuthOpen = false;

  let cookie = {};
  try {
    if ($cookies.user_data) {
      cookie = JSON.parse($cookies.user_data);
    }
  } catch (e) {
    cookie = undefined;
  }

  $scope.key = {};

  if (cookie && cookie.keys && Array.isArray(cookie.keys)) {
    if ($scope.selected >= cookie.keys.length) $scope.selected = 0;
    $scope.key.api_key = cookie.keys[$scope.selected].api_key;
    $scope.project_names = cookie.keys.map(v => v.name);
  } else if (cookie.keys) {
    $scope.key.api_key = cookie.keys.api_key;
  }

  $scope.values = {
    body: {},
    query: {},
    formData: {},
    path: {},
    header: {},
  };


  $scope.results = {};
  $('.hub-reference-results', $el).removeClass('on');

  $scope.addObjectToArray = (paramIn, model, object) => {
    const toAdd = _.cloneDeep(object);
    if ($scope.values[paramIn][model] && $scope.values[paramIn][model].length) {
      $scope.values[paramIn][model].push(toAdd);
    } else {
      $scope.values[paramIn][model] = [toAdd];
    }
    for (const key in object) {
      object[key] = undefined;
    }
    $scope.code();
  };

  $scope.tryItOut = function () {
    $scope.results = { init: true, loading: true };
    $scope.endpointForm.$setPristine();

    // Bad greg.... bad
    $('body, html').animate({ scrollTop: $('.api-definition', $el).parent().offset().top });

    getEndpointData(makeRequest);
  };

  function makeRequest(response) {
    const swagger = response.data.swagger;

    const apiSettings = response.data.apiSettings;
    if (!$scope.apiAuth.ready(swagger, $scope.key.api_key)) {
      $scope.results = { init: true };
      $timeout(() => {
        $scope.results.needsAuth = true;
      }, 600);
      $scope.isAuthOpen = true;
      return;
    }
    $scope.isAuthOpen = false;

    const { query, headers, body, url } = prepareParams(response);

    let values;
    if (Object.keys($scope.values.body).length) {
      // jQuery makes you stringify JSON
      values = JSON.stringify(body);
    } else if (Object.keys($scope.values.formData).length) {
      values = $.param(body);
    }

    // Add query string
    let urlFull = url;
    if (Object.keys(query).length) {
      const queryString = $.param(query);
      if (urlFull.indexOf('?') < 0) {
        urlFull += `?${queryString}`;
      } else {
        urlFull += `&${queryString}`;
      }
    }

    let req = {
      tryitnow: true, // This is so we can hijack it for Box's docs
      method: swagger._method,
      url: swagger[extensions.PROXY_ENABLED] ? `${response.data.proxy_url}/${urlFull}` : urlFull,
      headers,
      data: values,
      dataType: 'json',
    };

    if (window.cookieAuthentication) {
      req.xhrFields = { withCredentials: true };
    }

    // Do variable replacement

    // This seems potentially dangerous to stringify a whole
    // JSON object and then parse it, but seems to be
    // working for now? It's so much cleaner and less prone
    // to errors than the old way of looping through each field.

    const variables = {};
    if (apiSettings) {
      _.each(apiSettings.authextra, (v) => {
        if (v.key in $scope.apiAuth.auth) {
          variables[v.key] = $scope.apiAuth.auth[v.key];
        } else if (v.default) {
          variables[v.key] = v.default;
        }
      });
    }

    req = JSON.parse(JSON.stringify(req).replace(/\[\[app:(.+?)\]\]/g, (a, key) => {
      if (key in variables) {
        return variables[key];
      }
      return `YOUR_APP_${key.toUpperCase()}`;
    }));

    req.complete = result;

    // If it's actually an OPTIONS method (and not
    // a jQuery-enabled preflight), do the proper thing.
    if (req.method === 'options') {
      req.headers['options-bypass'] = 1;
    }

    $.ajax(req);

    function result(res) {
      const data = res.responseJSON ? JSON.stringify(res.responseJSON, undefined, 2) : res.responseText;

      // This is very Box-centric...
      const isBinary = !!res.getAllResponseHeaders().match(/Content-Disposition: attachment;/);

      const headersFormatted = [];
      _.each(req.headers, (v, k) => {
        headersFormatted.push(`${k}: ${v}`);
      });

      // Remove X-Final-Url (sent by the proxy)
      let responseHeaders = res.getAllResponseHeaders();
      responseHeaders = _.filter(responseHeaders.split('\n'), v => !v.match(/x-final-url:/i)).join('\n');

      $scope.results = {
        init: true,
        method: swagger._method.toUpperCase(),
        requestHeaders: headersFormatted.join('\n'),
        responseHeaders,
        isBinary,
        url: urlFull,
        data: values,
        statusCode: shared.statusCodes(res.status || 404),
        dataString: data,
      };
      $('.hub-reference-results', $el).addClass('on');

      setTab($('[data-tab=result]', $el));

      $scope.$apply();
    }
  }

  const setTab = ($tab) => {
    const tab = $tab.data('tab');
    const $parent = $tab.closest('.tabber-parent');
    $parent.find('.selected').removeClass('selected');
    $tab.addClass('selected');

    $parent.find('.tabber-body').hide();
    $parent.find(`.tabber-body-${tab}`).show();
  };

  $scope.hideResults = () => {
    $('.hub-reference-results', $el).removeClass('on');
    setTab($('[data-tab=0]', $el));
  };

  let getEndpointData = (function () {
    let response;
    return function (cb) {
      if (!response) {
        const $msi = $('.mini-swagger-inline', $el);
        if ($msi.length) {
          // This is only used for the Swagger Preview, since the endpoint
          // won't work. So we embed it in the HTML!
          response = JSON.parse($msi.text());
          cb(response);
        } else {
          const url = `/api/v${version.version}/docs/${$scope.slug}/swagger`;
          $http.get(url).then((_response) => {
            response = _response;
            cb(response);
          });
        }
      } else {
        cb(response);
      }
    };
  }());

  let prepareParams = (response) => {
    const swagger = response.data.swagger;
    // TODO: technically we shouldn't default to http... we should use whatever the Swagger
    // file is served as.
    const protocol = swagger.schemes.length ? swagger.schemes[0] : 'http';

    let url = `${protocol}://${swagger.host}${swagger.basePath || ''}`;
    _.each(response.data.chunkUrl, (path) => {
      if (path.type === 'text') {
        url += path.value;
      } else {
        let val = '';
        if (path.value in $scope.values.path) {
          val = $scope.values.path[path.value];
        } else if (path.param && path.param.default) {
          val = path.param.default;
        } else if (path.value === 'version') {
          val = version.version;
        } else {
          val = path.value; // Just use the name, I guess?
        }
        url += val;
      }
    });

    const query = {};
    const body = {};
    const headers = {
      Accept: shared.swaggerGetType(swagger.produces),
      'Content-Type': shared.swaggerGetType(swagger.consumes),
    };

    _.each(swagger._endpoint.parameters, (param) => {
      if (param.in === 'query') {
        const value = getParamEndpointValue(param, $scope.values.query);
        if (typeof value !== 'undefined') {
          query[param.name] = value;
        }
      }

      if (param.in === 'header') {
        const value = getParamEndpointValue(param, $scope.values.header);
        if (typeof value !== 'undefined') {
          headers[param.name] = value;
        }
      }

      if (param.in === 'body') {
        Object.keys(param.schema.properties).forEach((prop) => {
          const value = getParamEndpointValue(_.extend({}, param.schema.properties[prop], { name: prop }), $scope.values.body);
          if (typeof value !== 'undefined') {
            body[prop] = value;
          }
        });
      }

      if (param.in === 'formData') {
        const value = getParamEndpointValue(param, $scope.values.formData);
        if (typeof value !== 'undefined') {
          body[param.name] = value;
        }
      }
    });

    if (swagger[extensions.HEADERS] && Object.keys(swagger[extensions.HEADERS]).length) {
      _.each(swagger[extensions.HEADERS], (v) => {
        if (v.key) {
          v.key = v.key.replace(' ', '%20');
          headers[v.key] = v.value;
        }
      });
    }

    const securitySettings = swagger._endpoint.security || swagger.security; // Check endpoint, then global
    _.each(securitySettings, configureSecurity.bind(null, swagger, query, headers, $scope));

    return { headers, query, body, url };
  };


  // Auto-code stuff
  let firstCode = true;
  $scope.codeLoading = false;
  $scope.code = function () {
    // Use a copy cause updating $scope.values caused this to never stop running
    const valuesCopy = _.cloneDeep($scope.values);

    // Fix arrays to be what swagger expects
    for (const type in valuesCopy) {
      for (const elem in valuesCopy[type]) {
        // Empty Arrays should be undefined
        if (Array.isArray(valuesCopy[type][elem]) && !valuesCopy[type][elem].length) {
          valuesCopy[type][elem] = undefined;
        } else if (Array.isArray(valuesCopy[type][elem])) {
          // Convert tag format to array of just the elements
          valuesCopy[type][elem] = valuesCopy[type][elem].map(i => i.text || i);
        }
      }
    }

    if (firstCode) {
      firstCode = false; return; // Because watches run this instantly
    }
    $scope.codeLoading = true;

    getEndpointData((response) => {
      $http.post('/docs/code', {
        values: valuesCopy,
        swagger: response.data.swagger,
      }).success((_response) => {
        $scope.codeLoading = false;
        _.each(_response, (code, lang) => {
          $(`.hub-reference-left .code-sample pre.hub-lang-${lang}`, $el).html(code);
        });
      });
    });
  };

  // http://stackoverflow.com/questions/25712888/how-to-use-a-watchgroup-with-object-equality-or-deep-watch-the-properties-in-th
  const group = items => () => items.map(angular.bind($scope, $scope.$eval));
  $scope.$watch(group(['values', 'apiAuth.auth']), _.debounce($scope.code, 500), true);

  // Populate code samples with the defaults
  // This must be below the watch above ^^
  if ($('#swagger-x-send-defaults').length) {
    $scope.code();
  }

  $scope.setLanguage = function (lang) {
    const before = $('.hub-reference-section-code', $el).offset().top;
    const st = $(window).scrollTop();
    user.setLanguage(lang);
    $('body').removeClass((i, css) => (css.match(/(^|\s)is-lang-\S+/g) || []).join(' '));
    $('body').addClass(`is-lang-${lang}`);

    function reset() {
      const after = $('.hub-reference-section-code', $el).offset().top;
      const diff = after - before;
      $(window).scrollTop(st + diff);
      $(window).trigger('resize');
    }
    reset();
    setTimeout(reset, 1); // Sometimes it doesn't catch
  };

  if (user.language) {
    // Once we move the /me stuff right into the original HTML,
    // we'll always have a user.language (and if not, we should
    // use 'curl'.
    // $scope.setLanguage(user.language);
  }
});

app.factory('apiAuth', () => {
  const auth = {
    auth: {},
    ready(swagger, apiKey) {
      let ready = true;
      const securitySettings = swagger._endpoint.security || swagger.security; // Check endpoint, then global
      _.each(securitySettings, (sec) => {
        const key = Object.keys(sec)[0];

        if (!swagger.securityDefinitions[key]) return;
        const security = swagger.securityDefinitions[key];

        if (security.type === 'basic') {
          if (!auth.auth._basic_username) {
            ready = false;
          }
        }

        if (security.type === 'apiKey') {
          if (!auth.auth[security.name]) {
            ready = false;
          }
        }

        if (security.type === 'oauth2') {
          if (!auth.auth[security.name]) {
            ready = !!apiKey;
          }
        }
      });

      return ready;
    },
  };

  // // Load from cookies
  // try {
  //   auth.auth = JSON.parse(getCookie('readme_app')) || {};
  // } catch(e) {}
  //
  // // Watch it, save to a cookie after X seconds
  //
  // $rootScope.$watch(function() { return auth.auth; }, _.debounce(function(newVal, oldVal) {
  //   setCookie('readme_app', JSON.stringify(auth.auth), false);
  // }, 1000), true);

  return auth;
});

import 'angular-cookies';

/* @ngInject */
function variableKeys($cookies, user) {
  return {
    restrict: 'E',
    templateUrl: '/directive/variables/key-vars',
    replace: true,
    scope: {
      v: '@',
      data: '@',
      isdefault: '@',
    },
    link(scope) {
      scope.selected = window.localStorage.selected_app ? window.localStorage.selected_app : 0;

      scope.showDropdown = !!scope.isdefault && !!user.oauthEnabled;

      scope.select = function (i) {
        window.localStorage.selected_app = i;
      };

      let initializing = true;

      const variableName = scope.v;

      let cookie = {};
      try {
        cookie = JSON.parse($cookies.user_data);
        if (scope.selected >= cookie.keys.length) scope.selected = 0;
        scope.value = cookie.keys[scope.selected][variableName];
        scope.dropdown = cookie.keys.length > 1; // only show dropdown picker if multiple keys
        scope.project_names = cookie.keys.map(v => v.name);
      } catch (e) {
        // console.log(e);
        scope.value = scope.data;
      }

      function updateSelected(i) {
        scope.selected = i;
        scope.value = cookie.keys[scope.selected][variableName];
      }

      scope.$watch(
        () => window.localStorage.selected_app,
        (newVal) => {
          if (!initializing) {
            updateSelected(newVal);
          } else {
            initializing = false;
          }
        },
      );
    },
  };
}

/* @ngInject */
function variable($cookies, $http, user) {
  return {
    restrict: 'E',
    templateUrl: '/directive/variables/user-vars',
    replace: true,
    scope: {
      v: '@',
      data: '@',
      isdefault: '@',
    },
    link(scope) {
      scope.showDropdown = !!scope.isdefault && !!user.oauthEnabled;
      // Have to assign to something than data cause of weird angular scoping
      scope.value = scope.data;
    },
  };
}

export default angular.module('rm.variable', ['ngCookies'])
  .directive('variable', variable)
  .directive('variableKeys', variableKeys)
  .name;

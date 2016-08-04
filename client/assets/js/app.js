(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
.controller('FilmsCtrl',
  ["$scope", "$state", "$http",function($scope, $state, $http){
  // Grab URL parameters - this is unique to FFA, not standard for
  // AngularJS. Ensure $state is included in your dependencies list
  // in the controller definition above.
  $scope.id = ($state.params.id || '');
  $scope.page = ($state.params.p || 1);

  // If we're on the first page or page is set to default
  if ($scope.page == 1) {
    if ($scope.id != '') {
      // We've got a URL parameter, so let's get the single entity's
      // data from our data source
      $http.get("http://swapi.co/api/"+'films'+"/"+$scope.id,
          {cache: true })
        .success(function(data) {
          // If the request succeeds, assign our data to the 'film'
          // variable, passed to our page through $scope
          $scope['film'] = data;
        })

    } else {
      // There is no ID, so we'll show a list of all films.
      // We're on page 1, so the next page is 2.
      $http.get("http://swapi.co/api/"+'films'+"/", { cache: true })
        .success(function(data) {
          $scope['films'] = data;
          if (data['next']) $scope.nextPage = 2;
        });
    }
  } else {
    // Once again, there is no ID, so we'll show a list of all films.
    // If there's a next page, let's add it. Otherwise just add the
    // previous page button.
    $http.get("http://swapi.co/api/"+'films'+"/?page="+$scope.page,
      { cache: true }).success(function(data) {
        $scope['films'] = data;
        if (data['next']) $scope.nextPage = 1*$scope.page + 1;
      });
      $scope.prevPage = 1*$scope.page - 1;
  }
  return $scope;
}])
.directive("getProp", ['$http', '$filter', function($http, $filter) {
  return {
    template: "{{property}}",
    scope: {
      prop: "=",
      url: "="
    },
    link: function(scope, element, attrs) {
      // Use Aerobatic's caching if we're on that server
      var urlApi = scope.url,
        queryParams = {
          cache: true
        };

      if (window.location.hostname.match('aerobaticapp')) {
        queryParams = {
          params: {
            url: urlApi,
            cache: 1,
            ttl: 30000 // cache for 500 minutes
          }
        }
        urlApi = '/proxy';
      }

      var capitalize = $filter('capitalize');
      $http.get(urlApi, queryParams).then(function(result) {
        scope.property = capitalize(result.data[scope.prop]);
      }, function(err) {
        scope.property = "Unknown";
      });
    }
  }
}])
.filter('capitalize', function() {
  // Send the results of this manipulating function
  // back to the view.
  return function (input) {
    // If input exists, replace the first letter of
    // each word with its capital equivalent.
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g,
      function(txt){return txt.charAt(0).toUpperCase() +
        txt.substr(1)}) : '';
  }
})
.filter('lastdir', function () {
  // Send the results of this manipulating function
  // back to the view.
  return function (input) {
    // Simple JavaScript to split and slice like a fine chef.
    return (!!input) ? input.split('/').slice(-2, -1)[0] : '';
  }
})
})();

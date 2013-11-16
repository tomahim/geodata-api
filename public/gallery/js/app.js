'use strict';

var app = angular.module('gallery', ["leaflet-directive", "restangular"]);

/* Route Config */

app.config(['$routeProvider', function($routeProvider) {
      $routeProvider
      .when('/trips', 
        {templateUrl: 'partials/trips', controller: 'TripsCtrl'}
      )
      .when('/add-trip', 
        {templateUrl: 'partials/add-trip', controller: 'TripsCtrl'}
      )
      .when('/list-countries', 
        {templateUrl: 'partials/list-countries', controller: 'CountriesCtrl'}
      )
      .when('/list-cities', 
        {templateUrl: 'partials/list-cities', controller: 'CitiesCtrl'}
      )
      .otherwise({ redirectTo: '/' });
}]);

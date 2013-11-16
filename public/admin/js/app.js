'use strict';

var app = angular.module('admin-geodata', ["leaflet-directive", "restangular", "ui.bootstrap", "ngGrid", "ui.bootstrap.tpls"]);

/* Route Config */

app.config(['$routeProvider', function($routeProvider, $rootScope) {
      $routeProvider      
      .when('/dashboard', 
        {templateUrl: 'partials/index/dashboard', controller: 'DashboardCtrl'}
      )
      .when('/countries', 
        {templateUrl: 'partials/countries/countries', controller: 'CountriesCtrl'}
      )
      .when('/edit-country/:countryId', 
        {templateUrl: 'partials/countries/edit-country', controller: 'CountriesCtrl'}
      )
      .when('/cities', 
        {templateUrl: 'partials/cities/cities', controller: 'CitiesCtrl'}
      )
      .when('/add-city', 
        {templateUrl: 'partials/cities/add-city', controller: 'CitiesCtrl'}
      )
      .when('/edit-city/:cityId', 
        {templateUrl: 'partials/cities/edit-city', controller: 'CitiesCtrl'}
      )
      .otherwise({ redirectTo: '/dashboard' });
}]);

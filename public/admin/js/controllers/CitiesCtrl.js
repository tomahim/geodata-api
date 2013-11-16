'use strict';

var defaultCenter = {
            lat: 49.66762782262192,
            lng: 7.294921874999999,
            zoom: 4
        };

app.controller('CitiesCtrl', function($scope, $routeParams, $location, Restangular, MessageAPI) {
   
    var cities = Restangular.all("cities");
    $scope.selectedCityData = {};
    $scope.cityToSave = {};
    $scope.center = defaultCenter;
    $scope.cities = {};
    $scope.bounds = {};
    $scope.markers = [];
    var markersAdd = [];
    $scope.orderCondition = "iso_id";

    $scope.init = function() {
        $scope.changeBounds("Paris");

        $scope.columns = [
          { field: "country.name", displayName: "Country", enableCellEdit: false, cellTemplate: "<div class='special-field'>{{row.entity.country.name}} ({{row.entity.country._id}})</div>"},
          { field: "name", displayName: "Name"},
          { field: "lat", displayName: "Lat.", width:"10%", cellTemplate: "<div class='special-field'>{{row.entity[col.field] | number:2}}</div>"},
          { field: "lng", displayName: "Long.", width:"10%", cellTemplate: "<div class='special-field'>{{row.entity[col.field] | number:2}}</div>"},
          { field: "zoom", displayName: "Zoom", width:"10%"},
          { field: "", displayName: "Actions", cellTemplate: "<div class='special-field'><a href='#/edit-city/{{row.entity._id}}'>Edit<a></div>", sortable: false},
        ];

        $scope.selectedCities = []; 
        $scope.gridContent = {
            data : 'cities', 
            columnDefs: 'columns',
            multiSelect : false,
            selectedItems: $scope.selectedCities,
            enablePaging: true, // enables the paging feature
            afterSelectionChange: function () {
                if($scope.selectedCities[0] != undefined) {
                  console.log('selected', $scope.selectedCities);
                  angular.extend($scope, getInfosMoveMap($scope.selectedCities[0]));
                }
            },
            enableRowSelection: true,
            enableCellEdit: true,
            pagingOptions: {
                pageSizes: [50, 100, 200], //page Sizes
                pageSize: 20, //Size of Paging data
                totalServerItems: $scope.cities.length, //of how many items are on the server (for paging)
                currentPage: 1, //of what page they are currently on
            },
            showFilter: false
        };

        //Page Edit
        if($routeParams.cityId != undefined) {
                console.log('edit');
            //A mettre dans un service !
             Restangular.one("cityById", $routeParams.cityId).get()
            .then(function(data) {
                $scope.cityToSave = data;
                console.log('cityToSave', $scope.cityToSave);
                angular.extend($scope, getInfosMoveMap($scope.cityToSave));
            });
            sychronizeZoomMapEdit();
        }

        $scope.countrySearch = ""; 
        $scope.citySearch = "";
        cities.getList().then(function(data) {
            $scope.cities = data;  

            $scope.allCities = angular.copy($scope.cities, []);
            $scope.$watch('countrySearch', function(){
                if($scope.countrySearch != "") {
                    $scope.cities = $scope.allCities.filter( function(item) {
                        return (item.country.name.toLowerCase().indexOf($scope.countrySearch.toLowerCase())>-1);
                    });
                }
                if($scope.citySearch != "") {
                    $scope.cities = $scope.cities.filter( function(item) {
                        return (item.name.toLowerCase().indexOf($scope.citySearch.toLowerCase())>-1);
                    });
                }                
                if($scope.countrySearch == "" && $scope.citySearch == "") {
                    $scope.cities = angular.copy($scope.allCities, []);
                }
            });
            $scope.$watch('citySearch', function(){
                if($scope.citySearch != "") {
                    $scope.cities = $scope.allCities.filter( function(item) {
                        return (item.name.toLowerCase().indexOf($scope.citySearch.toLowerCase())>-1);
                    });
                }
                if($scope.countrySearch != "") {
                    $scope.cities = $scope.cities.filter( function(item) {
                        return (item.country.name.toLowerCase().indexOf($scope.countrySearch.toLowerCase())>-1);
                    });
                }
                if($scope.citySearch == "" && $scope.countrySearch != "") {
                    $scope.cities = angular.copy($scope.allCities, []);
                }
            });
        });
    }

    $scope.resetSearch = function() {
        $scope.citySearch = $scope.countrySearch = "";
    }

    $scope.changeBounds = function(nameCity) {
        Restangular.one("city", nameCity).get()
          .then(function(data) {
            $scope.selectedCityData = data;
        }).then(function() {            
            angular.extend($scope, getInfosMoveMap($scope.selectedCityData));            
        });
    };

    $scope.selectCity = function(city) {
        $scope.changeBounds(city.name);
    }

    $scope.saveCity = function() {
        var url = $scope.cityToSave._id != undefined ? 'updateCity' : 'saveCity';
        Restangular.one(url).post(null, $scope.cityToSave)
        .then(function(data) {
             $scope.$watch('data', function() {
                if(data._id != undefined) {
                    MessageAPI.success("City saved !");
                } else {
                    MessageAPI.error("An error occured");
                }
             });
        });
    }

    $scope.searchCity = function(searchForm) {
        $scope.cityToSave = {};
       
        Restangular.one("cityData", $scope.search.cityName).get()
        .then(function(data) {
            $scope.cityToSave = data;
            $scope.$watch('cityToSave', function() {
                if($scope.cityToSave._id != undefined) {
                    $scope.allreadyInDb = true;
                    MessageAPI.success("La ville recherchée est déjà dans la base de données !");
                } else {                    
                    $scope.allreadyInDb = false;
                    MessageAPI.clear();
                }
                angular.extend($scope, getInfosMoveMap($scope.cityToSave));
                sychronizeZoomMapEdit();
            });
        });
    }

    var getInfosMoveMap = function(location) {
        markersAdd.pop();
        markersAdd.push({"lat":location.lat,"lng":location.lng,"message":location.name});
        return {
            center : {
                        lat: location.lat,
                        lng: location.lng,
                        zoom: location.zoom
                    },
            bounds : location.gmaps_bounds,
            markers : markersAdd
        };
    }

    var sychronizeZoomMapEdit = function() {
        $scope.$watch('cityToSave.zoom', function() {
            $scope.center.zoom = $scope.cityToSave.zoom;
        });
        $scope.$watch('center.zoom', function() {
            $scope.cityToSave.zoom = $scope.center.zoom;
        });
    }
    
});
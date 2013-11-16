'use strict';

var defaultCenter = {
            lat: 49.66762782262192,
            lng: 7.294921874999999,
            zoom: 4
        };
        
app.controller('CountriesCtrl', function($scope, $routeParams, MessageAPI, Restangular, $http) {
    
    var countries = Restangular.all("countries");
    $scope.selectedCountryData = {};
    //$scope.center = defaultCenter;
    $scope.bounds = {};
    
    $scope.orderCondition = "iso_id";

    $scope.init = function() {
        $scope.countries = countries.getList(); 

        //Page Edit
        if($routeParams.countryId != undefined) {
            //A mettre dans un service !
             Restangular.one("countryById", $routeParams.countryId).get()
            .then(function(data) {
                $scope.countryToSave = data;
                angular.extend($scope, getInfosMoveMap($scope.countryToSave));

                $scope.$watch('center.zoom', function() {
                    $scope.countryToSave.zoom = $scope.center.zoom;
                });
                $scope.$watch('countryToSave.zoom', function() {
                    $scope.center.zoom = $scope.countryToSave.zoom;
                });
            });
        } else {
            $scope.defaultMapPosition();
        }

        $scope.selectedCountries = [];   
        $scope.columns = [
          { field: "_id", displayName: "ID", cellTemplate: "<div class='special-field'><img src='../img/flags/{{row.entity._id}}-24.png'/><span class='country-id'>{{row.entity._id}}</span><div class='clearer'></div></div>", width:'13%'},
          { field: "name", displayName: "Name"},
          { field: "lat", displayName: "Lat.", width:"10%", cellTemplate: "<div class='special-field'>{{row.entity[col.field] | number:2}}</div>"},
          { field: "lng", displayName: "Long.", width:"10%", cellTemplate: "<div class='special-field'>{{row.entity[col.field] | number:2}}</div>"},
          { field: "zoom", displayName: "Zoom"},
          { field: "", displayName: "Actions", cellTemplate: "<div class='special-field'><a href='#/edit-country/{{row.entity._id}}'>Edit<a></div>", sortable: false},
        ];

        $scope.gridContent = {
            data : 'countries', 
            columnDefs: 'columns',
            multiSelect : false,
            selectedItems: $scope.selectedCountries,
            enablePaging: true, // enables the paging feature
            afterSelectionChange: function () {
                if($scope.selectedCountries[0] != undefined) {
                  console.log('selected', $scope.selectedCountries);
                  angular.extend($scope, getInfosMoveMap($scope.selectedCountries[0]));
                }
            },
            enableRowSelection: true,
            enableCellEdit: true,
            pagingOptions: {
                pageSizes: [50, 100, 200], //page Sizes
                pageSize: 20, //Size of Paging data
                totalServerItems: $scope.countries.length, //of how many items are on the server (for paging)
                currentPage: 1, //of what page they are currently on
            },
            showFilter: true
        };
    }

    $scope.saveCountry = function(countryToSave) {
        countryToSave = countryToSave || $scope.countryToSave;
        var url = 'updateCountry';
        Restangular.one(url).post(null, countryToSave)
        .then(function(data) {
             $scope.$watch('data', function() {
                if(data._id != undefined) {
                    MessageAPI.success("Country saved!");
                } else {
                    MessageAPI.error("An error occured");
                }
             });
        });
    }

    var getInfosMoveMap = function(location) {
        /*markersAdd.pop();
        markersAdd.push({"lat":location.lat,"lng":location.lng,"message":location.name});*/
        var zoom = (location.zoom != undefined) ? location.zoom : 4;
        var geojson = {};
        geojson.data = {"type":"Feature",
                        "geometry":                                                        
                              {
                              "type": location.boundaries_geometry_type,
                               "coordinates":
                                location.boundaries_coordinates
                                  
                              },
                                "properties":{"name":location.name},
                                "id":location.iso_id
                        };

        geojson.style = {
                          "color": "#FF1CAE",
                          "weight": 0.2,
                          "opacity": 12
                        }; 
        return {
            center : {
                        lat: location.lat,
                        lng: location.lng,
                        zoom: zoom
                    },
            bounds : location.gmaps_bounds,
            geojson : geojson
            /*markers : markersAdd*/
        };
    }

    $scope.defaultMapPosition = function() {          
        Restangular.one("country", "France").get()
        .then(function(data) {
            $scope.selectedCountries.push(data);
            angular.extend($scope, getInfosMoveMap(data));
        });
    }

     $scope.$on('ngGridEventEndCellEdit', function(data) {
        $scope.saveCountry($scope.selectedCountries[0]);
     });

});
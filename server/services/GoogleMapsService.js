var gm = require('googlemaps');
var geocoder = require('geocoder');
var util = require('util');

exports.attach = function (options) {

	var servicesCallback = this.servicesCallbacks;
	var serviceName = "GoogleMapsService";
	var CityModel = this.CityModel;
	servicesCallback[serviceName] = {};

	this.servicesCallbacks[serviceName].adressPosition = function(req, res) {
		geocoder.geocode(req.params.adress, function ( err, data ) {
  			if(data.status == "OK") {
				var addresses_details = data.results[0].address_components;
				var address = data.results[0];
				for(var i = 0; i < addresses_details.length; i++) {
					console.log("type", addresses_details[i].types[0]);
					if (addresses_details[i].types[0] == "locality") {
		                city = addresses_details[i];
		                console.log('city', city);
		            }
		            if (addresses_details[i].types[0] == "administrative_area_level_1") {
		                //this is the object you are looking for
		                region = addresses_details[i];
		                console.log('region', region);
		            }
		            if (addresses_details[i].types[0] == "country") {
		                country = addresses_details[i];
		                console.log('country', country);
		            }
				}
				var geometry = address.geometry;
				console.log('formatted_address', address.formatted_address);
				console.log('lng', geometry.location.lng);
				console.log('lat', geometry.location.lat);

				//Todo : create city model, country model, region model objects with json data
				console.log('CityModel', CityModel);
			} else {
				return res.send("500", "Google map get location infos : " + data.status);
			}
			return res.send(data);
		// do something with data
		});
	};

	this.servicesCallbacks[serviceName].reversePosition = function(req, res) {

   		gm.reverseGeocode('41.850033,-87.6500523', function(err, data){
			return res.send(JSON.stringify(data));
		});
	};
}
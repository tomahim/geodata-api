var gm = require('googlemaps');
var util = require('util');
var geocoder = require('geocoder');

exports.attach = function (options) {

	var servicesCallback = this.servicesCallbacks;
	var serviceName = "CityService";
	var CityModel = this.CityModel.model;
	var CountryModel = this.CountryModel.model;

	servicesCallback[serviceName] = {};

	this.servicesCallbacks[serviceName].findAll = function(req, res) {

	    return CityModel.find()
    			.sort( { when: 1 } )
				.populate('country')
				.exec(function(err, cities) {
			if (!err) {
				return res.send(cities);
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].findByName = function(req, res) {

	    return CityModel.findOne({"name" : req.params.name})
				.populate('country')
				.exec(function(err, city) {
			if (!err) {
				return res.send(city);
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].findById = function(req, res) {
		console.log("get by id");
		 return CityModel.findOne({"_id" : req.params.cityId})
				.populate('country')
				.exec(function(err, city) {
			if (!err) {
				return res.send(city);
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].saveCity = function(req, res) {

		if(req.body._id == undefined) {
 			var city = new CityModel(req.body);
 		} else {

 		}
        city.save(function (err) {
			  if (err) {
				return res.send(500, err);
			  } else {
					return res.send(city);
			  }
		});
	};

	this.servicesCallbacks[serviceName].updateCity = function(req, res) {

		return CityModel.findOne({"_id" : req.body._id})
				.populate('_id')
				.exec(function(err, city) {
			if (!err) {
				city.name = req.body.name;
				city.name_url = req.body.name_url;
				city.lat = req.body.lat;
				city.lng = req.body.lng;
				city.zoom = req.body.zoom;

				city.save(function (err) {
					if (err) {
						return res.send(500, err);
					} else {
						return res.send(city);
					}
				});
			} else {
				return res.send(500, err);
			}
		});
	};
	
	//Find data in DB if exist otherwise with the gmaps api
	this.servicesCallbacks[serviceName].cityData = function(req, res) {

	    return CityModel.findOne({"name" : req.params.name})
					.populate('_id')
					.exec(function(err, city) {
			if (!err) {
				if(city != undefined) {
					return res.send(200, city);
				} else {
					var gm_geo = null;
					var gm_bounds = null;
					var gm_viewport = null;
			  		geocoder.geocode(decodeURI(req.params.name), function ( err, data ) {
			  			if(data && data.status == "OK") {
							gm_geo = data.results[0].geometry;
							gm_bounds = gm_geo.bounds;
							gm_viewport = gm_geo.viewport;

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
						
							if(country != undefined && city != undefined) {
								var cityFound = {
						  			country : country.short_name,
								  	name   : city.long_name,
								  	formatted_address : address.formatted_address,	
								  	name_url : city.long_name.replace(/\s+/g, '-').toLowerCase(),
								  	zoom : 10
						  		};


				  				if(gm_bounds != undefined) {
				  					cityFound.formatted_address = gm_geo.formatted_address;
				  				}
								if(gm_bounds != undefined) {
									cityFound.gmaps_bounds = gm_bounds;
								}

								if(gm_viewport != undefined) {
						     	    cityFound.gmaps_viewport = gm_viewport;
								}

								if(gm_geo != undefined) {
								    cityFound.gmaps_location_type = gm_geo.location_type;
								    cityFound.gmaps_types = data.results[0].types;
								    cityFound.lat = gm_geo.location.lat;
								    cityFound.lng = gm_geo.location.lng;
								}	
								return res.send(206, cityFound);
							} else {
								return res.send(204);
							}
			  			} else {
			  				console.log("error gmap on ", req.params.name, " status ", data.status);
			  			}		
					});
				}
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].initCapitals = function(req, res) {
		
		var cityToSave, capitalToSave;

	     async.waterfall([
	     		function readData(callback) {
					fs.readFile('./data/cities/captitals.json', 'latin', function (err, data) {
						callback(err, JSON.parse(data));
					});		 
	     		}, 
			    function getMainInfos(cities, callback){
				    for(var i = 0; i < cities.length; i ++) {
				    	cityToSave = cities[i];
				    	if(cityToSave.capital != "") {

					  		captitalToSave = {
					  			country : cityToSave.cca2,
							  	name   : cityToSave.capital,
							  	name_url : cityToSave.capital.replace(/\s+/g, '-').toLowerCase(),
							  	capital : true,
							  	currency : cityToSave.currency
					  		};
					    	callback(null, captitalToSave);		
					    } 			    		    		
			    	}
			    },
			    function savingCityInDB(captitalToSave, callback){
			    	var city = new CityModel(captitalToSave);
			        city.save(function (err) {
						  if (err) {
						  	console.log('error insert city ' + city.name + " -> " + err);
						  } else {
						  	console.log(' ok ' + city.name )
						  }
						  callback(null, city.name);
					});
			    }
			], function (err, obj) { // Waterfall end
				if (err) console.error(err);
			});

	    return res.send(200);
	};

	this.servicesCallbacks[serviceName].firstImport = function(req, res) {

		var cityToSave;

	     async.waterfall([
	     		function readData(callback) {
					fs.readFile('./data/cities/cities.geo.json', 'utf-8', function (err, data) {
						callback(err, JSON.parse(data));
					});		 
	     		}, 
			    function getMainInfos(data, callback){
				    for(var i = 0; i < data.features.length; i ++) {
				    	feature = data.features[i];
				    	geometry = feature.geometry;
				  		cityToSave = {
				  			name : feature.properties.city, 
				  			name_url : feature.properties.city.replace(/\s+/g, '-').toLowerCase(),
				  			wikipedia_url : feature.properties.wikipedia,
						  	lng : geometry.coordinates[0],
						  	lat : geometry.coordinates[1]
				  		};
					    cityToSave.gmaps_location = [geometry.coordinates[0], geometry.coordinates[1]];
				    	callback(null, cityToSave);					    		    		
			    	}
			    },
			    function savingCityInDB(cityToSave, callback){
			    	var city = new CityModel(cityToSave);
			        city.save(function (err) {
						  if (err) {
						  	console.log('error insert city ' + city.name + " -> " + err);
						  } else {
						  	console.log(' ok ' + city.name + ' -> ' + cityToSave.lng + ', ' + cityToSave.lat)
						  }
						  callback(null, city.name);
					});
			    }
			], function (err, obj) { // Waterfall end
				if (err) console.error(err);
			});

	    return res.send(200);
	};

	this.servicesCallbacks[serviceName].saveGMapsInfos = function(req, res) {

		var cityToSave = {};
		var errors = [];

	     async.waterfall([
	     		function findCities(callback) {
	     			console.log('find');
					CityModel.find({ gmaps_bounds: { $exists: false }})
					.populate('_id')
					.limit(10)
					.exec(function(err, cities) {
						if (!err) {
				    		callback(null, cities);
						} else {
				    		callback(err, null);					    		
						}
					});	 
	     		},
	     		function loopOnCities(cities, callback) {
	     			for (var i = 0; i < cities.length; i++) {
	     				cityToSave = cities[i];
	     				callback(null, cityToSave);
	     			};
	     		},
			    function getGMapsInfos(cityToSave, callback){
				   	var gm_geo = null;
					var gm_bounds = null;
					var gm_viewport = null;
			  		geocoder.geocode(decodeURI(cityToSave.name), function ( err, data ) {
			  			if(data && data.status == "OK") {

							gm_geo = data.results[0].geometry;
							gm_bounds = gm_geo.bounds;
							gm_viewport = gm_geo.viewport;
							
							if(gm_geo.location.lat != undefined 
							   && gm_geo.location.lng  != undefined
							   && (
							   		cityToSave.lat >= (gm_geo.location.lat-1) && cityToSave.lat <= gm_geo.location.lat
							   		|| cityToSave.lat <= (gm_geo.location.lat+1) && cityToSave.lat >= gm_geo.location.lat
							   	) 
							   && (
							   		cityToSave.lng >= (gm_geo.location.lng-1) && cityToSave.lng <= gm_geo.location.lng
							   		|| cityToSave.lng <= (gm_geo.location.lng+1) && cityToSave.lng >= gm_geo.location.lng
							   	) 
							   ) {

				  				if(gm_bounds != undefined) {
				  					cityToSave.formatted_address = gm_geo.formatted_address;
				  				}
								if(gm_bounds != undefined) {
									cityToSave.gmaps_bounds = gm_bounds;
								}

								if(gm_viewport != undefined) {
						     	    cityToSave.gmaps_viewport = gm_viewport;
								}
								if(gm_geo != undefined) {
								    cityToSave.gmaps_location_type = gm_geo.location_type;
								    cityToSave.gmaps_types = data.results[0].types;
								}	

							} else {
								console.log( cityToSave.name + ' found ' + cityToSave.lng+ ' ' + cityToSave.lat 
									         + ' but is ' + gm_geo.location.lng + ' ' + gm_geo.location.lat ) ;
							}
			  			} else {
			  				console.log("error gmap on ", cityToSave.name, " status ", data.status);
			  			}
		        		callback(null, cityToSave);  		
					});
			    },
			    function savingCityInDB(cityToSave, callback){
			    	cityToSave.save(function (err) {
						  if (err) {
						  	console.log('error updating city ' + cityToSave.name + " -> " + err);
						  } else {
						  	console.log('Update ok ' + cityToSave.name )
						  }
						  callback(null, cityToSave.name);
					});
			    }
			], function (err, obj) { // Waterfall end
				if (err) console.error(err);
			});
		return res.send(200);
	};

	this.servicesCallbacks[serviceName].importCities = function(req, res) {
		console.log('type request : ' + req.params.type);
		switch(req.params.type) {
			case 'first' :
				async.waterfall([
		     		function readData(callback) {
		     			fs.readFile('./data/cities/main_cities.json', 'utf-8', function (err, data) {
							callback(err, JSON.parse(data));
						});
		     		},
		     		function loopOnCities(data, callback){
					    for(var i = 0; i < data.length; i ++) {
					    	callback(null, data[i]);					    					    		    		
				    	}
				    },
				    function getCountryId(city, callback){
				    	CountryModel.findOne({name : city.country}).populate('_id').exec(function(err, country) {
							if (!err) {
								callback(null, {city1: city, country1 : country});							
							} else {
								return res.send(500, err);
							}
						});						
				    },
				    function savingCityInDB(data, callback){
						if(data.country1 != undefined) {
							cityToSave = {
										  name : data.city1.city, 
										  name_url : data.city1.city.replace(/\s+/g, '-').toLowerCase(),
										  country : data.country1._id									  
										};
				    		var city = new CityModel(cityToSave);
					        city.save(function (err) {
								  if (err) {
								  	console.log('error insert city ' + city.name + " -> " + err);
								  } else {
								  	console.log(' ok ' + city.name )
								  }
								  callback(null, city.name);
							});
						} else {
							console.log("country not found  " + data.city1.country);
						}		    	
				    }
				], function (err, obj) { // Waterfall end
					if (err) console.error(err);
				});
				break;
			case 'wiki' :
				var cityToSave = null;
				async.waterfall([
		     		function readData(callback) {
						fs.readFile('./data/cities/cities.geo.json', 'utf-8', function (err, data) {
							callback(err, JSON.parse(data));
						});		 
		     		}, 
				    function loopOnCities(data, callback){
					    for(var i = 0; i < data.features.length; i ++) {
					    	callback(null, data.features[i]);					    		    		
				    	}
				    },
				    function getMatchningCityInDb(feature, callback) {
				    	CityModel.findOne({name :  decodeURI(feature.properties.city)}).populate('_id').exec(function(err, city) {
							if (!err) {
								console.log(feature.properties.city + " -> " + feature.properties.wikipedia);
								callback(null, {wiki: feature, city1 : city});							
							} else {
								return res.send(500, err);
							}
						});
				    },
				    function savingCityInDB(data, callback){
				    	if(data.city1 != undefined) {
					    	cityToSave = data.city1;
					    	cityToSave.wikipedia_url = data.wiki.properties.wikipedia;
							//console.log("save " + cityToSave.name);
					    	cityToSave.save(function (err) {
								  if (err) {
								  	//console.log('error update city ' + cityToSave.name + " -> " + err);
								  } else {
								  	//console.log(' ok ' + cityToSave.name);
								  }
								  callback(null, data.wiki.properties.city);
							});
						} else {
							//console.log(data.wiki.properties.city + " is undefined ");
						}
				    }
				], function (err, obj) { // Waterfall end
					if (err) console.error(err);
				});
				break;
			case 'gmaps' :

		     async.waterfall([
		     		function findCities(callback) {
						CityModel.find({ lat: { $exists: false }})
						.populate('_id')
						.limit(15)
						.exec(function(err, cities) {
							if (!err) {
					    		callback(null, cities);
							} else {
					    		callback(err, null);					    		
							}
						});	 
		     		},
		     		function loopOnCities(cities, callback) {
		     			for (var i = 0; i < cities.length; i++) {
		     				cityToSave = cities[i];
		     				callback(null, cityToSave);
		     			};
		     		},
				    function getGMapsInfos(cityToSave, callback){
					   	var gm_geo = null;
						var gm_bounds = null;
						var gm_viewport = null;
						console.log("get gmaps info " + cityToSave.name + " " + cityToSave.country);
				  		geocoder.geocode(cityToSave.name + " " + cityToSave.country, function ( err, data ) {
				  			if(data && data.status == "OK") {		
								gm_geo = data.results[0].geometry;
								gm_bounds = gm_geo.bounds;
								gm_viewport = gm_geo.viewport;
								console.log("bounds of " + cityToSave.name);
								if(gm_bounds != undefined) {
									cityToSave.gmaps_bounds = gm_bounds;
								}

								if(gm_viewport != undefined) {
						     	    cityToSave.gmaps_viewport = gm_viewport;
								}
								if(gm_geo != undefined) {
								    cityToSave.gmaps_location_type = gm_geo.location_type;
								    cityToSave.gmaps_types = data.results[0].types;
								    cityToSave.gmaps_location = [gm_geo.location.lng, gm_geo.location.lat];
								    cityToSave.lng = gm_geo.location.lng;
								    cityToSave.lat = gm_geo.location.lat;
								}		
				  			} else {
				  				console.log("error gmap on ", cityToSave.name, " status ", data.status);
				  			}
			        		callback(null, cityToSave);  		
						});
				    },
				    function savingCityInDB(cityToSave, callback){
				    	cityToSave.save(function (err) {
							  if (err) {
							  	console.log('error updating city ' + cityToSave.name + " -> " + err);
							  } else {
							  	console.log('Update ok ' + cityToSave.name )
							  }
							  callback(null, cityToSave.name);
						});
				    }
				], function (err, obj) { // Waterfall end
					if (err) console.error(err);
				});

				break;
		} 
		

		return res.send(200);

	};
}
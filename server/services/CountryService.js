var fs = require('fs');
var geocoder = require('geocoder');
async = require('async');
request = require('request');


exports.attach = function (options) {

	var servicesCallback = this.servicesCallbacks;
	var serviceName = "CountryService";
	var CountryModel = this.CountryModel.model;
	servicesCallback[serviceName] = {};

	this.servicesCallbacks[serviceName].getAllCountries = function(req, res) {
		return CountryModel.find()
					.populate('_id')
					.sort({'name' : 'asc'})
					.exec(function(err, countries) {
			if (!err) {
				return res.send(countries);
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].getCountryByName = function(req, res) {
		return CountryModel.findOne({"name" : req.params.name})
					.populate('_id')
					.exec(function(err, country) {
			if (!err) {
				return res.send(country);
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].findById = function(req, res) {
		console.log("get by id");
		 return CountryModel.findOne({"_id" : req.params.countryId})
				.populate('_id')
				.exec(function(err, country) {
			if (!err) {
				return res.send(country);
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].updateCountry = function(req, res) {

		return CountryModel.findOne({"_id" : req.body._id})
				.populate('_id')
				.exec(function(err, country) {
			if (!err) {
				country.name = req.body.name;
				country.name_url = req.body.name_url;
				country.lat = req.body.lat;
				country.lng = req.body.lng;
				country.zoom = req.body.zoom;

				country.save(function (err) {
					if (err) {
						return res.send(500, err);
					} else {
						return res.send(country);
					}
				});
			} else {
				return res.send(500, err);
			}
		});
	};

	this.servicesCallbacks[serviceName].firstImport = function(req, res) {

		var feature, countryToSave;

	     async.waterfall([
	     		function readData(callback) {
					fs.readFile('./data/countries/countries_boundaries.geo.json', 'utf-8', function (err, data) {
						callback(err, JSON.parse(data));
					});		 
	     		}, 
			    function getMainInfos(data, callback){
				    for(var i = 0; i < data.features.length; i ++) {
				    	countryToSave = buildCountriesDocuments(data.features[i]);
				    	callback(null, countryToSave);					    		    		
			    	}
			    },
			    function savingCountryInDB(countryToSave, callback){
			    	var country = new CountryModel(countryToSave);
			        country.save(function (err) {
						  if (err) {
						  	console.log('error insert country ' + country.name + " -> " + err);
						  } else {
						  	console.log(' ok ' + country.name )
						  }
						  callback(null, country.name);
					});
			    }
			], function (err, obj) { // Waterfall end
				if (err) console.error(err);
			});
		 

		  function buildCountriesDocuments(feature) {
				
		  		geometry = feature.geometry;

		  		dataToSave = {
		  			_id : feature.id, 
		  			name : feature.properties.name, 
		  			name_url : feature.properties.name.replace(/\s+/g, '-').toLowerCase(),
		  			boundaries_geometry_type : geometry.type,
		  			boundaries_coordinates : geometry.coordinates
		  		};
		  		return dataToSave;
		  }

	    return res.send(200);
	};

	var self = this.servicesCallbacks[serviceName];

	this.servicesCallbacks[serviceName].saveGMapsInfos = function(req, res) {

		var countryToSave = {};

	     async.waterfall([
	     		function findCountries(callback) {
					CountryModel.find({ lat: { $exists: false }})
					.populate('_id')
					.exec(function(err, countries) {
						if (!err) {
				    		callback(null, countries);
						} else {
				    		callback(err, null);					    		
						}
					});	 
	     		},
	     		function loopOnCountries(countries, callback) {
	     			for (var i = 0; i < countries.length; i++) {
	     				countryToSave = countries[i];
	     				callback(null, countryToSave);
	     			};
	     		},
			    function getGMapsInfos(countryToSave, callback){
				   	var gm_geo = null;
					var gm_bounds = null;
					var gm_viewport = null;
					console.log("get gmaps info " + countryToSave.name);
			  		geocoder.geocode(countryToSave.name, function ( err, data ) {
			  			if(data && data.status == "OK") {		
							gm_geo = data.results[0].geometry;
							gm_bounds = gm_geo.bounds;
							gm_viewport = gm_geo.viewport;
							console.log("bounds of " + countryToSave.name);
							if(gm_bounds != undefined) {
								countryToSave.gmaps_bounds = gm_bounds;
							}

							if(gm_viewport != undefined) {
					     	    countryToSave.gmaps_viewport = gm_viewport;
							}
							if(gm_geo != undefined) {
							    countryToSave.gmaps_location_type = gm_geo.location_type;
							    countryToSave.gmaps_types = data.results[0].types;
							    countryToSave.gmaps_location = [gm_geo.location.lng, gm_geo.location.lat];
							    countryToSave.lng = gm_geo.location.lng;
							    countryToSave.lat = gm_geo.location.lat;
							}		
			  			} else {
			  				console.log("error gmap on ", countryToSave.name, " status ", data.status);
			  			}
		        		callback(null, countryToSave);  		
					});
			    },
			    function savingCountryInDB(countryToSave, callback){
			    	countryToSave.save(function (err) {
						  if (err) {
						  	console.log('error updating country ' + countryToSave.name + " -> " + err);
						  } else {
						  	console.log('Update ok ' + countryToSave.name )
						  }
						  callback(null, countryToSave.name);
					});
			    }
			], function (err, obj) { // Waterfall end
				if (err) console.error(err);
			});

	    return res.send(200);
	};

	this.servicesCallbacks[serviceName].renameFlagsFiles = function(req, res) {

		var country = {};

	     async.waterfall([
	     		function findCountries(callback) {
					CountryModel.find()
					.populate('_id')
					.exec(function(err, countries) {
						if (!err) {
				    		callback(null, countries);
						} else {
				    		callback(err, null);					    		
						}
					});	 
	     		},
	     		function loopOnCountries(countries, callback) {
	     			for (var i = 0; i < countries.length; i++) {
	     				country = countries[i];
	     				callback(null, country);
	     			};
	     		},
			    function findMatchingFile(country, callback){
			    	var dirPath = './data/countries/flags/png/';
				   	var countryName = country.name.replace(/\s/g, "-");
				   	try {

					    if(fs.existsSync(dirPath+countryName+"-64.png")) {
					    	console.log(country.name + " found : " + countryName+"-64.png");
					    	console.log("---> rename by " + country._id + "-64.png");
					    	fs.renameSync(dirPath+countryName+"-64.png", dirPath+country._id+"-64.png");
					    	console.log("\n");
					    }

					    if(fs.existsSync('./data/countries/flags/png/'+countryName+"-Flag-64.png")) {
					    	console.log(country.name + " found : " + countryName+"-Flag-64.png");
					    	console.log("---> rename by " + country._id + "-64.png");
					    	fs.renameSync(dirPath+countryName+"-Flag-64.png", dirPath+country._id+"-64.png");
					    	console.log("\n");					    	
					    }

					    if(!fs.existsSync(dirPath+countryName+"-64.png") 
					       && !fs.existsSync('./data/countries/flags/png/'+countryName+"-Flag-64.png")
					       && !fs.existsSync('./data/countries/flags/png/'+country._id+"-64.png")) {
					    	console.log("not found : " + country.name+" => " + country._id);
					    }
					}
					catch (e) {
					    // ...
					}

					var formats = [16, 24, 32, 64, 128, 256];
					for (var i = 0; i < formats.length; i++) {
						try {
						fs.renameSync(dirPath + "South-Georgia-" + formats[i] + ".png",  dirPath + "GS-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Bahamas-Flag-" + formats[i] + ".png",  dirPath + "BS-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Cocos-Islands-" + formats[i] + ".png",  dirPath + "CC-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Dominicana-" + formats[i] + ".png",  dirPath + "DM-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Pitcairn-" + formats[i] + ".png",  dirPath + "PN-" + formats[i] + ".png");
						fs.renameSync(dirPath + "French-Southern-Territories-" + formats[i] + ".png",  dirPath + "TF-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Gambia-Flag-" + formats[i] + ".png",  dirPath + "GM-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Palestinian-Territory-" + formats[i] + ".png",  dirPath + "PS-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Vatican-City-" + formats[i] + ".png",  dirPath + "VA-" + formats[i] + ".png");
						fs.renameSync(dirPath + "North-Korea-Flag-" + formats[i] + ".png",  dirPath + "KP-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Korea-Flag-" + formats[i] + ".png",  dirPath + "KR-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Micronesia-Flag-" + formats[i] + ".png",  dirPath + "FM-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Bosnian-Flag-" + formats[i] + ".png",  dirPath + "BA-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Congo-Flag-" + formats[i] + ".png",  dirPath + "CG-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Croatian-Flag-" + formats[i] + ".png",  dirPath + "HR-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Congo-Kinshasa-" + formats[i] + ".png",  dirPath + "CD-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Saint Vincent and the Grenadines" + formats[i] + ".png",  dirPath + "VC-" + formats[i] + ".png");
						fs.renameSync(dirPath + "CentralAfricanRepublic" + formats[i] + ".png",  dirPath + "CF-" + formats[i] + ".png");
						fs.renameSync(dirPath + "Falkland-Islands-" + formats[i] + ".png",  dirPath + "FK-" + formats[i] + ".png");	
						fs.renameSync(dirPath + "Ivory-Coast-Flag-" + formats[i] + ".png",  dirPath + "CI-" + formats[i] + ".png");	
						} catch(e) {

						}
					};
			    },
			    function renameFile(file, callback){
			    	
			    }
			], function (err, obj) { // Waterfall end
				if (err) console.error(err);
			});

	    return res.send(200);
	};

}
var async = require('async'),
request = require('request');


exports.attach = function (options) {

	var servicesCallback = this.servicesCallbacks;
	var serviceName = "StatsService";
	var CountryModel = this.CountryModel.model;
	var CityModel = this.CityModel.model;
	var mongoose = this.mongoose;
	console.log('mongoose', mongoose);
	servicesCallback[serviceName] = {};

	this.servicesCallbacks[serviceName].getCityRepartition = function(req, res) {
		var limit = 15;
		if(req.params.limit != undefined) {
			limit = parseInt(req.params.limit);
		}
		var results = [];
		CityModel.aggregate(  
		    { $group: 
		    		{ _id: '$country', 
		    		  total: { $sum: 1 }
		    		},
		    },
		    {$sort: {"total": -1}},
		    {$limit : limit},
			    function (err, citiesTotal) {
			        if(err){
			            return res.send(500, { error: err }); 
				        
			    	} 
			    	if(citiesTotal) {
			    		var totalProcessed = 0;
			    		async.waterfall([
						    function loopOnResults(callback){
							    for(var i = 0; i < citiesTotal.length; i ++) {
							    	city = citiesTotal[i];
							    	callback(null, city, i);					    		    		
						    	}
						    },
						    function searchCountryInfos(country, index, callback){
						    	CountryModel.findOne({"_id" : country._id})
									.populate('_id')
									.exec(function(err, countryResult) {
										if (!err) {
											citiesTotal[index].country = countryResult;
						    				callback(null, citiesTotal);
										} else {
											//return res.send(500, err);
										}
						   			});
							}], function (err, list) { // Waterfall end
								totalProcessed++;
								if(totalProcessed == list.length) {	
									return res.send(citiesTotal);
								}
								if (err) console.error(err);
							});
			    		//return res.send(citiesTotal);
				    } else {
		            	res.send(500, { error: "could'nt find cities" }); 
		       		}
		});
	};

	this.servicesCallbacks[serviceName].getSizeDbData = function(req, res) {
		//console.log(mongoose.connections[0].db);
		
		return res.send(200);
	};

}
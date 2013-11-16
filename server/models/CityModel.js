var modelName = "City";

exports.attach = function (options) {
	var mongoose = this.mongoose;

	this.CityModel = {};
	this.CityModel.name = modelName;
	
	this.CityModel.schema = new mongoose.Schema({
	  	country : {type: String, uppercase: true, ref: 'Country', trim: true, match: /[A-Z]{2}/},
	  	region_id : {type: mongoose.Schema.ObjectId},	  	
	  	name   : String,
	  	name_url : String,
	  	formatted_address : String,
	  	capital : Boolean,
	  	currency : String,
	  	wikipedia_url : String,
	  	gmaps_bounds : mongoose.Schema.Types.Mixed,
	  	gmaps_viewport : mongoose.Schema.Types.Mixed,
	  	gmaps_location : String,
	  	gmaps_location_type : String,
	  	gmaps_types : Array,
	  	zoom : { type: Number, default: 10},
	  	lng : Number,
	  	lat : Number
	});

	this.CityModel.model = mongoose.model(this.CityModel.name, this.CityModel.schema);
}
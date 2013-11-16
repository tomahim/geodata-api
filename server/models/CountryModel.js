var modelName = "Country";

exports.attach = function (options) {
	var mongoose = this.mongoose;

	this.CountryModel = {};
	this.CountryModel.name = modelName;
	
	this.CountryModel.schema = new mongoose.Schema({
	  	_id : {type: String, uppercase: true, trim: true, match: /[A-Z]{2}/},
	  	name   : String,
	  	name_url : String,
	  	boundaries_geometry_type : {type: String, enum: ["MultiPolygon", "Polygon"]},	  	
	  	boundaries_coordinates : mongoose.Schema.Types.Mixed,
	  	gmaps_bounds : mongoose.Schema.Types.Mixed,
	  	gmaps_viewport : mongoose.Schema.Types.Mixed,
	  	gmaps_location : Array,
	  	gmaps_location_type : String,
	  	gmaps_types : Array,
	  	zoom : { type: Number, default: 4},
	  	lng : Number,
	  	lat : Number
	});

	this.CountryModel.model = mongoose.model(this.CountryModel.name, this.CountryModel.schema);
}
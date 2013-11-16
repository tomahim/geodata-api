var mongoose = require('mongoose');

exports.attach = function (options) {
	console.log(options);
	this.mongoose = {};  
	this.mongoose = mongoose;

	var models = options.models || [];
	
	//Init mongoose models
	if (models.length > 0) {
		for(var i = 0; i < models.length; i++) {
			console.log('init model', models[i]);
			this.use(require(models[i]));
		}
	}

	this.mongoose.close = function() {
		mongoose.connection.close();
	}
};

exports.init = function(done) {
	mongoose.connect(this.conf['db'].url, function() {
   		console.log('Connection to mongoose'); 
	});

	return done();
};
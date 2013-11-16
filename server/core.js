var express = require("express")
	app = express(),
    CityService = require('./services/CityService'),
    fs = require('fs');

var port = 3002;

exports.attach = function (options) {

	//Parsing POST data
	app.use(express.bodyParser());

	// Template settings
	app.set('views', './public/');
	app.set('view engine', "jade");
	app.engine('jade', require('jade').__express);

	// Routes settings
	app.get("/", function(req, res){
	    res.render("index");
	});

	//Geo data administration routes
	app.get("/admin/", function(req, res){
	    res.render("admin/index");
	});

	app.get('/admin/partials/:folder/:name', function (req, res) {
	    var folder = req.params.folder;
	    var name = req.params.name;
	    console.log('test');
	    res.render("admin/partials/" + folder + "/" + name);
	});

	var services = options.services || [];

	//Init api services
	this.servicesCallbacks = [];
	if (services.length > 0) {
		for(var i = 0; i < services.length; i++) {
			this.use(require(services[i]));
		}
	}

	app.use(express.static('./public'));
	this.core = {};
	this.core.app = app;

	this.start = function() {
		this.core.app.listen(port);
		console.log("Listening on port " + port);
	}
}

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {

  // This plugin doesn't require any initialization step.
  return done();
};

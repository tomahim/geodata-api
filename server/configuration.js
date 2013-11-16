var fs = require('fs'),
	nconf = require('nconf'),
	path = require('path');


var configs;
var rootPath;

exports.attach = function (options) {

	this.conf = {};	
	
	configs = options.configs || [];
	
	rootPath = options.rootPath || path.normalize(__dirname + '/..');
	
	this.conf.rootPath = rootPath;
	if (configs.length > 0) {
			for(var i = 0; i < configs.length; i++) {
				var config = configs[i];
				nconf.file(config.name, config.path);
				this.conf[config.name] = nconf.get(config.name);
			}
	}
};

exports.init = function(done) {
	return done();
};
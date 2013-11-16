
exports.attach = function (options) {

	var apiRoutes = options.routes || [];

	var servicesCallbacks = this.servicesCallbacks;

	console.log(servicesCallbacks);
	var app = this.core.app;
	// API URLs config
	var routeFile = null;
	if(apiRoutes.length > 0) {
		for (var index = 0; index < apiRoutes.length; index++) {
			routeFile = apiRoutes[index];
			fs.readFile(routeFile, 'utf8', function (err, data) {
			if (err) {
				console.log('Error: ' + err);
				return;
			}		 
			servicesArray = JSON.parse(data);
			var serviceName = "";
			var servicesRoutes = [];
			var serviceRoute = {};
			var service;

			if(servicesArray.services.length > 0) {

				for(var i = 0; i < servicesArray.services.length; i++) {
					if(servicesArray.services[i].routes.length > 0) {
						serviceName = servicesArray.services[i].serviceName; 
						servicesRoutes = servicesArray.services[i].routes;

						for(var j = 0; j < servicesRoutes.length; j++) {
							serviceRoute = servicesRoutes[j];
							service = servicesCallbacks[serviceName];
							switch(serviceRoute.method) {
								case "GET" :
									app.get(serviceRoute.url, service[serviceRoute.callback]);
									break;
								case "POST" :
									app.post(serviceRoute.url, service[serviceRoute.callback]);
									break;
								case "PUT" :
									app.put(serviceRoute.url, service[serviceRoute.callback]);
									break;
								case "DELETE" :
									app.delete(serviceRoute.url, service[serviceRoute.callback]);
									break;
								default:
									app.all(serviceRoute.url, service[serviceRoute.callback]);
									break;	
							}

						}
					}
				}

			}
		 });
		};		
	}
}

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {

  // This plugin doesn't require any initialization step.
  return done();
};

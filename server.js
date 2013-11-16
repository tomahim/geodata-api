var broadway = require("broadway"),
    path = require("path");

var app = new broadway.App();

var rootPath = path.normalize(__dirname);

app.use(require(rootPath + '/server/configuration'), 
  {
    'configs': 
      [
        //{'name': 'server', 'path': rootPath + '/config/server.json'}, 
        {'name': 'db', 'path': rootPath + '/server/config/db.json'}
      ],
    'rootPath' : rootPath
  });

app.use(require(rootPath + '/server/persistence'), 
    {'models':
      [
        rootPath + '/server/models/CountryModel',
        rootPath + '/server/models/CityModel'
      ]
    });

app.use(require(rootPath + '/server/core'), 
	{ 
    'services':
    [
      rootPath + '/server/services/CityService',
      rootPath + '/server/services/CountryService',
      rootPath + '/server/services/StatsService',
      rootPath + '/server/services/GoogleMapsService'
    ]
  });

app.use(require(rootPath + '/server/router'), 
  {'routes' : 
    [
       rootPath + '/server/services/ApiRoutes.json'
    ]
  });

app.init(function (err) {
  if (err) {
    console.log('[Main     (ERR) ] ' + new Date() + ' :::> Error : ' + err);
  } 
});

app.start();
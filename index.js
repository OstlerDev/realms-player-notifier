var RealmsAPI = require("./RealmsAPI");
var config = require("./config")

var realms = new RealmsAPI(config.username, config.password);

realms.authenticate(function(data){
	realms.getOnlinePlayers(function(activePlayers){
		console.log("Currently Online Players: " + activePlayers);
	}, function(error){ console.error(error) })
}, function(error){ console.error(error) });
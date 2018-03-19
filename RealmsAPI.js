var axios = require('axios');

const AUTH_API_ADDRESS = "https://authserver.mojang.com";
const REALMS_API_ADDRESS = "https://pc.realms.minecraft.net";
const VERSION = "1.12.2"

module.exports =
class RealmsAPI {
	constructor(username, password) {
		this.username_ = username;
		this.password_ = password;
	}
	authenticate(onSuccess, onError){
		var _this = this;

		axios.post(AUTH_API_ADDRESS + "/authenticate", {
			"agent": {
				"name": "Minecraft",
				"version": 1
			},
			"username": this.username_,      
			"password": this.password_,
			"requestUser": true                    
		}).then(function(response){
			if (response && response.data && response.data.accessToken) {
				_this.accessToken_ = response.data.accessToken;
				_this.userID_ = response.data.selectedProfile.id;
				_this.name_ = response.data.selectedProfile.name;

				onSuccess(response.data)
			} else {
				onError(response.data)
			}
		}).catch(onError);
	}
	getServerID(onSuccess, onError){
		var _this = this;

		axios.get(REALMS_API_ADDRESS + "/worlds", {"headers": {"Cookie": "sid=token:" + this.accessToken_ + ":" + this.userID_ + ";user=" + this.name_ + ";version=" + VERSION} })
			.then(function(res){
				if (res.data && res.data.servers && res.data.servers[0]){
					_this.serverID_ = res.data.servers[0].id;
					onSuccess(_this.serverID_)
				} else {
					onError(res.data)
				}
			}).catch(onError)
	}
	getOnlinePlayers(onSuccess, onError){
		var _this = this;

		if (!this.serverID_)
			return this.getServerID(function(){ _this.getOnlinePlayers(onSuccess, onError) }, onError)

		axios.get(REALMS_API_ADDRESS + "/worlds/" + this.serverID_, {"headers": {"Cookie": "sid=token:" + this.accessToken_ + ":" + this.userID_ + ";user=" + this.name_ + ";version=" + VERSION} })
			.then(function(res){
				if (res.data && res.data.players){
					var OnlinePlayers = [];

					for (var player of res.data.players){
						if (player.online)
							OnlinePlayers.push(player.name);
					}

					onSuccess(OnlinePlayers);
				} else {
					onError(res.data)
				}
			}).catch(onError)
	}
}
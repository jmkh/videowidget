'use strict';
var httpclient = require('./httpclient');
var paths = require('./_config');
function viOS() {

	var iDevices = [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	];
	if (!!navigator.platform) {
		while (iDevices.length) {
			if (navigator.platform === iDevices.pop()){ return true; }
		}
	}

	return false;
}
function Configurator(config)
{
	var defaults={
		size:{width:"350",height:"400"},
		container:"#mp-video-widget-container-56015401b3da9-20",
		auth:{affiliate_id:"56015401b3da9",pid:"20"},
		errorFn:function(){},
		successFn:function(config){
		}
	};
	var localConfig=defaults;
	for(var i in config){
		if(config.hasOwnProperty(i)){
			localConfig[i]=config[i];
		}
	}
	//config=config||defaults;
    var self=this;
    this.loaded=false;
    var host = localConfig.auth.host.replace(/^www\./,'');

	this.configUrl = paths.config_url+ localConfig.auth.affiliate_id + "_" + localConfig.auth.pid + "_"+host+".json?p="+Math.random();
	var errorFn= config.errorFn  || function(){};
	var successFn= config.successFn || function(){};

	httpclient.ajax(this.configUrl,{errorFn:errorFn,successFn:function(res){
		try{
			var config=JSON.parse(res);
			if(typeof config.error!="undefined"){
				throw new Error("Виджет удалён.");
			}
			for(var i in config){
				if(config.hasOwnProperty(i)){
					self[i]=config[i];
				}
			}
			var isNotDesktop = /Android|Silk|Mobile|PlayBook/.test(window.navigator.userAgent);
			var isIos = viOS();
			self.isDesktop=!isNotDesktop;
			switch(true){
				case isIos:
					self.ads=config['ads-mobile'].iOS;
					break;
				case isNotDesktop:
					self.ads=config['ads-mobile'].Android;

					break;

			}
			httpclient.ajax(paths.referrer_url,{errorFn:function(){},successFn:function(res){
				try{
					var ref=JSON.parse(res);
					self.loaded=true;
					self.referer=ref;
					localConfig.successFn(self);
					window.parent.postMessage(config,'*');
				}catch(e){
					console.log('битая конфигурация',e);
				}
			}});
		}catch(e){
			console.log('битая конфигурация',e);
		}
	}});
	registerView(localConfig);
};
function registerView(config){

	var key = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	var preRemoteData = {
		key: key,
		fromUrl: encodeURIComponent(''),
		pid: config.auth.pid,
		affiliate_id: config.auth.affiliate_id,
		cookie_id: 0,
		id_src: 0,
		event: 'loadWidget',
		mess: ''
	};
	var toURL = paths.statistic_url+"?p=" + Math.random() + '&data=' + encodeURIComponent(JSON.stringify(preRemoteData));
	// console.log(["уйди со смыслом",data.eventName,toURL]);
	var img = new Image(1, 1);
	img.src = toURL;
}
module.exports = Configurator;
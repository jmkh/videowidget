'use strict';
var httpclient = require('./httpclient');
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
			console.log(config);

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

	this.configUrl = "https://widget.market-place.su/videooptions/" + localConfig.auth.affiliate_id + "_" + localConfig.auth.pid + ".json?p="+Math.random();
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
			//console.log(self,isIos,isNotDesktop);
			//alert("--"+isIos+"--"+isNotDesktop)
			//window.cnf=config;
			switch(true){
				case isIos:
					self.ads=config['ads-mobile'].iOS;
					break;
				case isNotDesktop:
					self.ads=config['ads-mobile'].Android;

					break;

			}
			httpclient.ajax("//widget.market-place.su/proxy_referer/",{errorFn:function(){},successFn:function(res){
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

			//localConfig.successFn(self);
			//window.parent.postMessage(config,'*');
		}catch(e){
			console.log('битая конфигурация',e);
		}
	}});
};
module.exports = Configurator;
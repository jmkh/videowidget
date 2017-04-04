(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.colorTrailer = true; 
(function() {

    function loadAssinc(){
		  if(typeof window.MyMpWidgetsVid=='undefined'){
		
		  }else{
		  return;
		  }
	window.MyMpWidgetsVid=1;
	function parseConfig() 
    {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
      vars[key] = value;
    });
    return vars;
    };
   var c_data=parseConfig();
	if(typeof c_data.pid=='undefined')
	{
	    c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"}; 
	}
	else
	{
		c_data.h1=unescape(c_data.h1); 
	} 
	 var config=new Configurator({auth:{affiliate_id:c_data.affiliate_id,pid:c_data.pid},successFn:function(config){
	 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
	 window.colorPixels.playType=1;
	    setTimeout(function () {
            window.colorPixels.AllowedStart=1;
        }, 10000);
	 window.colorPixels.setConfig(config,function(){
	 console.log(["кольбэк если надо"]);
		 var container=document.querySelector('#container');
		 var controller=document.querySelector('#mycontoller');

		 container.style.opacity=1;
		 controller.style.display='block';
		 var yplayer= new YouTubePlayer({height:"100%",width:"100%",autoplay:true,container:"container"});
		 yplayer.setVolume(0);
		 var done = false;
		 yplayer.on('statechange',function(event){
			 		console.log(event);
				 if (event.data == YT.PlayerState.ENDED && !done) {
					 console.log(event);
					 window.parent.postMessage({die:1},"*");
					 done = true;
				 }


		 });

	 }); 
     }});
    }


	if (typeof window.attachEvent!='undefined')
        window.attachEvent('onload', function(){loadAssinc();});
     else
        window.addEventListener('load', function(){loadAssinc();}, false);
	 setTimeout( // если страница не заканчивается
     function(){
     loadAssinc();
     },
     101);
})(); 
},{}]},{},[1])
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
	 console.log(["c_data",c_data]);
	 var config=new Configurator({auth:{affiliate_id:c_data.affiliate_id,pid:c_data.pid},successFn:function(config){
	 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
	 window.colorPixels.playType=1;
	    setTimeout(function () {
            window.colorPixels.AllowedStart=1;
        }, 10000);
	 window.colorPixels.setConfig(config,function(config){
	 window.colorPixels.playDefault(function(){
	 window.colorPixels.playTvigle(function(){
	 window.colorPixels.playTrailer(function(){
	 window.parent.postMessage({die:1},"*");
     });
	 
	
	 });
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
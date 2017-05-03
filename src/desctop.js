window.colorTrailer = true; 

(function() {

    function loadAssinc(){
		  if(typeof window.MyMpWidgetsVid=='undefined'){
		
		  }else{
		  return;
		  }
	window.MyMpWidgetsVid=1;
	try{
	
	function defaultFunctionReplay(config){
	CallAction('die',{index:config.page_index},window.parent);
    return;
	}
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
    if(typeof c_data.index=='undefined')
	{
	c_data.index='broadcast';
		//
	}
	
	//c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7",index:c_data.index}; 
	
	 if(typeof c_data.h1=='undefined')
	 c_data.h1=unescape(c_data.h1); 
     var bridge=new Bridge(c_data.index);
	 bridge.addAction("execute",function(data){

   
	 if(typeof data.config !="undefined"){
	 data.config.page_index=c_data.index;
	 
	 if(c_data.hasOwnProperty("testframe")){
	 data.config.testframe=1;
	 }

		 
		 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;

	     window.colorPixels.setConfig(data.config,defaultFunctionReplay);
	 
     }
	 
     });
    
    CallAction('ready',{index:c_data.index},window.parent);
	 }catch(e){
	 }
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
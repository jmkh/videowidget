/**
 * Created by admin on 13.03.17.
 */
'use strict';
function makeBridge(index){
    var index=index||getUniqueIndex();
    if(typeof  window.MpFrameBridges=="undefined") {
        window.MpFrameBridges={};
    };
    if(typeof  window.MpFrameBridges[index]!="undefined") {
        return  window.MpFrameBridges[index];
    }else {
        window.MpFrameBridges[index]=new Bridge(index);
        return window.MpFrameBridges[index];
    }

}
function callAction(name,data,window) {
    // посылает сообщение для указанного window.

    // action содержит в себе имя события и данные для развертывания
	
    window.postMessage({name:name,data:data,bridgeAction:true},'*');
}
function getUniqueIndex(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
function Bridge(index){

    this.index=index||getUniqueIndex();


    var self=this;

    var actions={
        "default":function(){
            // console.log(actions,this,self)
        }
    };

    this.execAction=function(name,data){
        var action=actions[name]||actions['default']||function(){};
        action.call(this,data);
    };

    this.addAction=function(name,dispatcher){
        actions[name]=dispatcher;
    };
    this.showActions=function(){console.log(actions)};



}
window.makeBridge=makeBridge;
window.mp_bridge_listener=function(event){

    if(typeof  event.data=="object") {
        if(typeof event.data.bridgeAction!="undefined"&& (event.data.bridgeAction==true)) {
            //broadcast
            if(event.data.data.index=="broadcast"&&typeof window.MpFrameBridges!="undefined") {


                for(var i in window.MpFrameBridges)
                {
                    if(window.MpFrameBridges.hasOwnProperty(i)){
                        window.MpFrameBridges[i].execAction(event.data.name,event.data.data);
                    }
                }
            }
             //console.log(event.data.name,event.data.data.index);
            makeBridge(event.data.data.index).execAction(event.data.name,event.data.data);

        }
    }

};
if(typeof window.MpBridgeListenerAttached=="undefined"){
    if (window.addEventListener) {
        window.addEventListener("message",mp_bridge_listener);
    } else {
        // IE8
        window.attachEvent("onmessage",  mp_bridge_listener);
    }
    window.MpBridgeListenerAttached=true;
}

module.exports ={Bridge:makeBridge,callAction:callAction};
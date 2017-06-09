'use strict'
var Overlay = require('./../models/Overlay');
if(typeof mPwConfig !="undefined" && mPwConfig.hasOwnProperty("affiliate_id")){
var tmp= new Overlay(mPwConfig);
}
window.CreateOverplayWidget=function(config){
var tmp= new Overlay(config);
}




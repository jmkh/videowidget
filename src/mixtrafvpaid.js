'use strict';
var VPAIDInterface = require('./../models/MIXTRAFInterface');
window.getVPAIDAd = function(){
return new VPAIDInterface();
}
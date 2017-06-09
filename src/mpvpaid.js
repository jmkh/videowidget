'use strict';
var VPAIDInterface = require('./../models/VPAIDInterface');
window.getVPAIDAd = function(){
return new VPAIDInterface();
}

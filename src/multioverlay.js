'use strict';
var multiDispatcher = require('./../models/dispatcher');
var Configurator = require('./../models/configurator');
var BridgeLib = require('./../models/iFrameBridge');
window.multiDispatcher = multiDispatcher; 
window.Configurator = Configurator; 
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
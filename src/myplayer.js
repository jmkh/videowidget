'use strict';
/**
 * Created by mambrin on 28.03.17.
 */
var mydispatcher= require('./../models/dispatcher');
var Configurator = require('./../models/configurator');
var YouTubePlayer = require('./../models/YoutubePlayer').player;

window.mydispatcher =mydispatcher;
window.Configurator = Configurator; 
window.YouTubePlayer = YouTubePlayer;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// actions
console.log('actions');
},{}],2:[function(require,module,exports){
//constants
module.exports = {
	PREV : "PREV",
	NEXT : "NEXT"
};
},{}],3:[function(require,module,exports){
// dispatcher
"use strict";

module.exports = (function(object) {
  object.init = function() {
    this._callback = [];
  };

  object.register = function(callback) {
    this._callback.push(callback);
    return this._callback.length;
  };

  object.unregister = function(callback) {
    /* delete callback to retain index. */
    delete this._callback[callback];
  };

  object.dispatch = function(payload) {
    for(var item in this._callback) {
      this._callback[item](payload);
    }
  };

  return object;
});

},{}],4:[function(require,module,exports){
//main
/*global require*/
var actions = require('./lib/actions.js'),
	constants = require('./lib/constants.js'),
	dispatcher = require('./lib/dispatcher.js');

	console.dir(constants);
},{"./lib/actions.js":1,"./lib/constants.js":2,"./lib/dispatcher.js":3}]},{},[4]);

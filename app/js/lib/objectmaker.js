// dispatcher
/*"use strict";

module.exports = (function(object) {
  object.init = function() {
    this._callback = [];
  };

  object.register = function(callback) {
    this._callback.push(callback);
    return this._callback.length;
  };

  object.unregister = function(callback) {
	  delete this._callback[callback];
  };

  object.dispatch = function(payload) {
    for(var item in this._callback) {
      this._callback[item](payload);
    }
  };
  console.log('dispatcher.js   ');
  console.dir(object);
  return object;
});
*/

/*global KF04RZ211_VID, ready*/
/*jslint browser: true, devel:true */
/*This module handles the video-element: loading, time-update, and more*/
// KF04RZ211_VID.addNS('PLAYER');
// KF04RZ211_VID.PLAYER =
// module.exports = 
//Module factory
/*global MARTIN, ready*/
/*jslint browser: true, devel:true */
// MARTIN.addNameSpace('OBJECTMAKER');


var MARTIN = {};



MARTIN.OBJECTMAKER = function (params) {
	
	
	
// module.exports = function (params) {
	"use strict";
	var maker = (function () {
		var privateVar = 'private',
			name = params.name,
			privateObj = {
				'one': 'one',
				'two': 'two'
			},
			privateMethod = function () {
				console.log('privateMethod');
				console.dir(privateObj);
			};

		return {
			init: function () {
				console.log('init:' + name);
			},
			getPrivateObj: function () {
				console.log('getPrivateObj:' + name);
				return privateObj;
			},
			getPrivateVar: function () {
				return privateVar;
			},
			print: function () {
				console.log('params');
				console.dir(params);
				console.log('privateVar:');
				console.log(privateVar);
				privateMethod();
			}
		};

	}());
	return maker;
};
module.exports = MARTIN.OBJECTMAKER;


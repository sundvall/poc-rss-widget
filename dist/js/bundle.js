(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module,require*/

var dispatcher = require("./dispatcher"),
	constants = require("./constants");

module.exports = {
	prev: function (id, data) {
		"use strict";
		dispatcher.dispatch({
			type: constants.PREV,
			id: id,
			data: data
		});
	},
	next: function (id, data) {
		"use strict";
		dispatcher.dispatch({
			type: constants.NEXT,
			id: id,
			data: data
		});
	},
	update: function (id,data) {
		"use strict";
		dispatcher.dispatch({
			type: constants.UPDATE,
			id: id,
			data: data
		});
	}
};

},{"./constants":2,"./dispatcher":3}],2:[function(require,module,exports){
//constants
module.exports = {
	PREV : "PREV",
	NEXT : "NEXT",
	UPDATE: "UPDATE"
};
},{}],3:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module*/


/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

module.exports = (function () {
	'use strict';
	var callbacks = {
		/*'dispatchToken': 'TPayload'*/
	},
		prefix = 'ID_',
		isDispatching = false,
		isHandled = {
			/*'dispatchToken': false*/
		},
		isPending = {
			/*'dispatchToken': false*/
		},
		lastID = 1,
		pendingPayload = 'TPayload',
		invokeCallback = function (dispatchToken) {
			/**
			 * Call the callback stored with the given id. Also do some internal
			 * bookkeeping.
			 *
			 * @internal
			 */
			isPending[dispatchToken] = true;
			callbacks[dispatchToken](pendingPayload);
			isHandled[dispatchToken] = true;
		},
		startDispatching = function (TPayload) {
			/**
			 * Set up bookkeeping needed when dispatching.
			 *
			 * @internal
			 */
			Object.keys(callbacks).forEach(function (disp_token) {
				isPending[callbacks[disp_token]] = false;
				isHandled[callbacks[disp_token]] = false;
			});
			pendingPayload = TPayload;
			isDispatching = true;
		},
		stopDispatching = function () {
			/**
			 * Clear bookkeeping used for dispatching.
			 *
			 * @internal
			 */
			// delete pendingPayload;
			pendingPayload = null;
			isDispatching = false;
		};

	return {
		register: function (TPayload) {
			/**
			 * Registers a callback to be invoked with every dispatched payload. Returns
			 * a token that can be used with `waitFor()`.
			 */
			var nextID = lastID + 1,
				dispatchToken = prefix + nextID;
			lastID = nextID;
			callbacks[dispatchToken] = TPayload;
			return dispatchToken;
		},
		unregister: function (dispatchToken) {
			/**
			 * Removes a callback based on its token.
			 */
			/*invariant(
				this.callbacks[id],
				'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
				id
			);*/
			try {
				delete callbacks[dispatchToken];
			} catch (e) {
				console.log('could not unregister from dispatcher:' + e);
			}

		},
		dispatch: function (TPayload) {
			// invariant(!this.isDispatching,
			if (isDispatching) {
				console.error('Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.');
			} else {
				startDispatching(TPayload);
				try {
					Object.keys(callbacks).forEach(function (disp_token) {
						console.log('dispatcher: token:' + disp_token);
						// console.dir(callbacks[disp_token]);
						// callbacks[disp_token]();
						
						if (!isPending[callbacks[disp_token]]) {
							invokeCallback(disp_token);
						}
					});
				} finally {
					stopDispatching();
				}
			}
		},
		isDispatching: function () {
			/**
			 * Is this Dispatcher currently dispatching.
			 */
			return isDispatching;
		},
		waitFor: function (array_of_dispatchTokens) {
			/**
			 * Waits for the callbacks specified to be invoked before continuing execution
			 * of the current callback. This method should only be used by a callback in
			 * response to a dispatched payload.
			 */
			var idsLength = array_of_dispatchTokens.length,
				ii = 0,
				id,
				ids;
			if (isDispatching) {
				console.warn('Dispatcher.waitFor(...): Must be invoked while dispatching.');
			} else {
				for (ii = 0; ii < idsLength; ii += 1) {
					id = ids[ii];
					if (!isPending[id]) {
						callbacks[id]();
					}
				}
			}
			/*waitFor(ids: Array < DispatchToken > ): void {
				invariant(
					this.isDispatching,
					'Dispatcher.waitFor(...): Must be invoked while dispatching.'
				);
				for (var ii = 0; ii < ids.length; ii++) {
					var id = ids[ii];
					if (this.isPending[id]) {
						invariant(
							this.isHandled[id],
							'Dispatcher.waitFor(...): Circular dependency detected while ' +
							'waiting for `%s`.',
							id
						);
						continue;
					}
					invariant(
						this.callbacks[id],
						'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
						id
					);
					this.invokeCallback(id);
				}
			}*/
		},
		print : function () {
			console.log('dispatcher:print:');
			console.dir(callbacks);
		}


	};
}());

},{}],4:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher'),
	events = require('events'),
	eventEmitter = new events.EventEmitter();
// slider_store = require('.slider_store');

// NS = {};
// NS.OBJECTMAKER = 
module.exports = function (params) {
	"use strict";
	// var maker = (function () {
	var itemsToDisplay = params.items || 3,
		urlToRss = params.url,
		dispatchToken,
		viewcontrol = params.viewcontrol,
		id = params.id,
		state = {
			'type': 'json formatted rss flow'
		},
		emitChange = function () {
			console.log('rsslist_store:emitChange');
			viewcontrol[id].update({
				'example': 'rsslist_store',
				'id': id,
				'state': state,
				'items': state.query.results.rss.channel.item
			});
		},
		ajaxAndRespondHandler = function (requestUrl, handler) {
			var fkn_ajaxsetup = new XMLHttpRequest();
			fkn_ajaxsetup.open('GET', requestUrl);
			fkn_ajaxsetup.onload = handler;
			fkn_ajaxsetup.send();
		},
		crossDomainRequest = function (xmlOrJson) {
			var yahooApi = 'http://query.yahooapis.com/v1/public/yql?q=';
			return yahooApi + encodeURIComponent('select * from ' + xmlOrJson + ' where url=\"' + urlToRss + '\"') + '&format=json';
		},
		responseHandler = function () {
			console.log('emit change');
			state = JSON.parse(this.response);
			// console.log(JSON.parse(this.response));
			emitChange();
		},
		getListAndRender = function () {
			ajaxAndRespondHandler(crossDomainRequest('xml'), responseHandler);
		},
		registerFluxActionHandlers = function () {
			dispatchToken = dispatcher.register(function (action) {
				/*if an id is provided only update the specific store and view*/

				if (action.type === constants.UPDATE) {
					// console.log('rsslist_store:update');
					// 					console.dir(action);
					// 					if (action.hasOwnProperty('id')) {
					// 						if (action.id === id) {
					// 							getListAndRender();
					// 						} else if (action.id === 'all') {
					if (action.id === id || action.id === 'all') {
						getListAndRender();
					}
					// } 
					// }
				}
			});
		};

	return {
		init: function () {
			registerFluxActionHandlers();
			// console.log('rss_list_store:viewcontrol:');
			// 			console.dir(viewcontrol);
			// 			console.log('rss_list_store:viewcontrol ' + id);
			// 			console.dir(viewcontrol[id]);
		},
		update: function () {
			getListAndRender();
		},
		getState: function () {
			return state;
		}
	};

	// }());
	// return maker;
};

},{"./actions":1,"./constants":2,"./dispatcher":3,"events":7}],5:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher');
// events = require('events').EventEmitter;
// events = require('events'),
// eventEmitter = new events.EventEmitter();
// slider_store = require('.slider_store');

// NS = {};
module.exports = function (params) {
	"use strict";
	// var maker = (function () {
	var itemsToDisplay = params.items || 3,
		containerElm = params.container,
		id = params.id,
		rssContainerElm,
		buttonElm,
		urlToRss = params.url,
		state = {
			'type': 'json formatted rss flow'
		};

	return {
		init: function () {
			console.log('slider_view:init');
			var html = '';
			html += '<h1>rss init:' + itemsToDisplay + '</h1>';
			html += '<ol class="rss_wrap">';
			html += '</ol>';
			html += '<button>update:id:' + id + '</button>';
			html += '</div>';
			containerElm.innerHTML = html;
			rssContainerElm = containerElm.querySelector('ol');
			containerElm.style.border = '2px solid black';
			buttonElm = containerElm.querySelector('button');
			buttonElm.addEventListener('click', function () {
				console.log(id);
				actions.update(id);
			});

		},
		update: function (data) {
			/*get state from store*/
			console.log('slider_view:update:' + data.id);
			// console.dir(data);
			var i = 0,
				html = '';
			for (i = 0; i < itemsToDisplay; i += 1) {
				html += data.items[i].description;
			}
			rssContainerElm.innerHTML = html;

			// getListAndRender();
		},
		getState: function () {
			return state;
		}
	};

	// }());
	// return maker;
};

},{"./actions":1,"./constants":2,"./dispatcher":3}],6:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global require*/
var actions = require('./lib/actions'),
	constants = require('./lib/constants'),
	dispatcher = require('./lib/dispatcher'),
	rsslist_store = require('./lib/rsslist_store'),
	slider_view = require('./lib/slider_view');
// eventEmitter = require('node-event-emitter').EventEmitter;
// events = require('events').EventEmitter;
// eventEmitter = new events.EventEmitter();
// slider_store = require('./lib/slider_store');


/*The function below counts the number of elements with class 'rss_display' that exists and gets configuration given in the 'rel' and 'items' attributes.
 *example:
 *<div class='rss_display' items='4' rel='http://www.aftonbladet.se/rss.xml'></div>
 *This configuration creates a container with 4 items from the given url.
 *This script is best put at the end of the page, or when the dom-content is surely loaded.
 */
(function () {
	'use strict';
	var nodelistAsArray = function (selector, el) {
		return (el ? Array.prototype.slice.call(el.querySelectorAll(selector)) : Array.prototype.slice.call(document.querySelectorAll(selector)));
	},
		rss_stores = [],
		viewControl = {},
		countElementsAndInitRss = function () {
			var allRssContainers = nodelistAsArray('.rss_display');
			allRssContainers.forEach(function (elm, index) {
				var sliderView = slider_view({
					'id': index,
					'container': elm,
					'items': elm.getAttribute('items')
				}),
					rssStore = rsslist_store({
						'id': index,
						'container': elm,
						'viewcontrol': viewControl,
						'url': elm.getAttribute('rel')
					});
				viewControl[index] = sliderView;
				sliderView.init();
				rss_stores.push(rssStore);
				rssStore.init();
				// console.log('main:sliderView');
				// console.dir(sliderView);
			});
			// console.log('main:viewControl:');
			// console.dir(viewControl);
			// console.log(viewControl[1].update({
			// 'id': 'testi d'
			// }));
		};
	countElementsAndInitRss();

	// var ringBell = function () {
	// 		console.log('ring bell');
	// 	};
	// 	eventEmitter.on('doorOpen', ringBell);

	setTimeout(function () {
		// console.log('main:tiemout');

		// eventEmitter.emit('doorOpen');
		actions.update('all');
		// actions.next();
	}, 1000);
}());

},{"./lib/actions":1,"./lib/constants":2,"./lib/dispatcher":3,"./lib/rsslist_store":4,"./lib/slider_view":5}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[6]);

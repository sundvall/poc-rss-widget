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
 This module is a transcription to ES5 of the facebook version for ES6.
https://github.com/facebook/flux/blob/master/src/Dispatcher.js
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

var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher');

module.exports = function (params) {
	"use strict";
	var	id = params.id,
		urlToRss = params.url,
		viewcontrol = params.viewcontrol,
		dispatchToken,
		state = {
			'type': 'json formatted rss flow'
		},
		emitChange = function () {
			viewcontrol[id].update({
				'from': 'rsslist_store',
				'id': id,
				'state': state
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
			state = JSON.parse(this.response);
			emitChange();
		},
		getListAndRender = function () {
			ajaxAndRespondHandler(crossDomainRequest('xml'), responseHandler);
		},
		registerFluxActionHandlers = function () {
			dispatchToken = dispatcher.register(function (action) {
				/*if an id is provided only update the specific store and view*/
				if (action.type === constants.UPDATE) {
					if (action.id === id || action.id === 'all') {
						getListAndRender();
					}
				}
			});
		};

	return {
		init: function () {
			registerFluxActionHandlers();
		},
		update: function () {
			getListAndRender();
		},
		getState: function () {
			return state;
		}
	};
};

},{"./actions":1,"./constants":2,"./dispatcher":3}],5:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher'),
	events = require('./utils/events'),
	height_scale = require('./utils/height_scale'),
	widget_resize = require('./utils/widget_resize'),
	item_resize = require('./utils/item_resize'),
	item_factory = require('./utils/item_factory'),
	slide_element = require('./utils/slide_element'),
	widgetwrap_factory = require('./utils/widgetwrap_factory');

module.exports = function (params) {
	"use strict";
	var itemsToDisplay = params.items || 3,
		containerElm = params.container,
		widgetResize,
		heightScale,
		itemFactory,
		itemResize,
		elements = {},
		id = params.id,
		slideElement,
		widgetWrapFactory,
		createWrapper = function () {
			widgetWrapFactory = widgetwrap_factory({
				container: containerElm,
				id: id
			});
			widgetWrapFactory.init();
			elements = widgetWrapFactory.getElements();
			elements.widget = containerElm;
		},
		controlWrapperHeight = function () {
			heightScale = height_scale({
				ref_elm: elements.widget,
				id: id,
				format: (elements.widget.getAttribute('format') || '16_9')
			});
			heightScale.init();
			heightScale.getHeight();
			widgetResize = widget_resize({
				elements: elements,
				items_to_display: itemsToDisplay
			});
			widgetResize.init();
			widgetResize.update(heightScale.getHeight());
		},
		controlListHeight = function () {
			widgetResize.update(heightScale.getHeight());
			itemResize = item_resize({
				elements: itemFactory.getElements()
			});
			itemResize.init();
			itemResize.update(heightScale.getHeight());
		},
		createItemHtml = function (itemlist) {
			itemFactory = item_factory({
				container: elements.items,
				id: id,
				items_to_display: itemsToDisplay,
				item: itemlist || [{
					category: 'category',
					description: 'description',
					guid: {
						content: 'permalink',
						isPermalink: 'true'
					},
					link: 'www...',
					pubDate: 'date',
					title: 'title'
				}]
			});
			itemFactory.init();
			return itemFactory.getElements();
		},
		createVerticalSlider = function (itemlist, steps) {
			steps = itemlist.length / itemsToDisplay;
			slideElement = slide_element({
				element: elements.items,
				stepsize: (itemsToDisplay * heightScale.getHeight()),
				steps: steps
			});
			slideElement.init();
		},
		addListeners = function () {
			//TODO modularize this to separate action
			/*A listener is added to the parent of the dynamic rss-flow. When the rss-flow is updated the listener remains, and reads the 'rel' attribute of the clicked element.*/
			var event_tool = events(),
				clickItemsHandler = function (e) {
					e.stopPropagation();
					var sendFkn = function (p) {
						var url = p.elm.getAttribute('rel');
						console.log('click:' + p.elm.getAttribute('rel'));
						if (url) {
							try {
								window.open(url, '_blank');
							} catch (e) {
								console.log('slider_viewcontrol:100:open external link:' + e);
							}
						}
					};
					event_tool.handle(e, '.rss_item', sendFkn, true);
				};
			event_tool.add(elements.items, 'click', clickItemsHandler);

			elements.nextbtn.addEventListener('click', function () {
				slideElement.next();
			});
			elements.prevbtn.addEventListener('click', function () {
				slideElement.prev();
			});
		};

	return {
		init: function () {
			/*Create the html wrapper*/
			createWrapper();
			/*Control the height of the wrapper*/
			controlWrapperHeight();
			/*add functionality to buttons and links*/
			addListeners();
		},
		update: function (data) {
			/*Replace and update the list inside the wrapper*/
			var itemlist,
				steps;
			try {
				itemlist = (data.state.query.results.rss.channel.item || data.state.query.results.feed.entry);
			} catch (e) {
				console.log('slider_viewcontrol:124: rss format is not supported.' + e);
			}
			createItemHtml(itemlist);
			/*Control the size of the list*/
			controlListHeight();
			/*Attach slider functionality*/
			createVerticalSlider(itemlist, steps);
		}
	};
};

},{"./actions":1,"./constants":2,"./dispatcher":3,"./utils/events":6,"./utils/height_scale":7,"./utils/item_factory":8,"./utils/item_resize":9,"./utils/slide_element":10,"./utils/widget_resize":11,"./utils/widgetwrap_factory":12}],6:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, CustomEvent*/
module.exports = function (params) {
	"use strict";
	
	var containsWord = function (string, word) {
		return new RegExp('\\b' + word + '\\b').test(string);
	},
		checkParentForFilterHit = function (element, filter, addFilter) {
			var node = element,
				additionalFilterHit = false,
				parentNode = node.parentNode,
				className = element.className,
				wrapFilterHit = false,
				wrapFilter = 'KF04RZ211adcont',
				seq = 0,
				parentTargetHit = false;
			while (parentNode !== null && !(seq > 15 || wrapFilterHit || parentTargetHit)) {
				node = parentNode;
				className = parentNode.className;
				parentTargetHit = containsWord(className, filter);
				wrapFilterHit = containsWord(className, wrapFilter);
				if (!additionalFilterHit) {
					additionalFilterHit = containsWord(className, addFilter);
				}
				seq += 1;
				parentNode = node.parentNode;
			}
			return {
				'filterHit': parentTargetHit,
				'targetElem': node,
				'className': className
			};
		},
		handle = function (e, classSelectorFilter, sendFkn, checkParent) {
			var handle = (function () {
				e = e || window.event;
				var targetElem = e.target || e.srcElement,
					filterHit = false,
					className = targetElem.className,
					data = e.detail,
					checkParentObj,
					filterClassName = classSelectorFilter.slice(1);
				filterHit = containsWord(className, filterClassName);
				if (!filterHit && checkParent) {
					checkParentObj = checkParentForFilterHit(targetElem, filterClassName);
					filterHit = checkParentObj.filterHit;
					className = checkParentObj.className;
					targetElem = checkParentObj.targetElem;
				}
				if (filterHit && sendFkn) {
					sendFkn({
						'elm': targetElem,
						'data': data,
						'e': e
					});
				}
				return {
					getEventObj: function () {
						return {
							'className': className,
							'data': data,
							'filterHit': filterHit,
							'filter': filterClassName
						};
					}
				};
			}());
			return handle;
		},
		startListening = function (parentElement, eventType, eventHandler) {
			if (parentElement.addEventListener) {
				parentElement.addEventListener(eventType, eventHandler, false);
			} else if (parentElement.attachEvent) {
				eventType = "on" + eventType;
				parentElement.attachEvent(eventType, eventHandler);
			} else {
				parentElement["on" + eventType] = eventHandler;
			}
		};

	return {
		add: function (parentElm, eventType, eventHandler) {
			startListening(parentElm, eventType, eventHandler);
		},
		handle: function (event, classSelectorFilter, sendFkn, checkParentFilterHit) {
			return handle(event, classSelectorFilter, sendFkn, checkParentFilterHit);
		}
	};
};
},{}],7:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
	The height is calculated from a selected aspect format.
 */
module.exports = function (params) {
	"use strict";

	var refElm = params.ref_elm,
		format = (params.format || '4_3'),
		aspects = {
			'4_3': {
				h: 3,
				w: 4
			},
			'1_1': {
				h: 1,
				w: 1
			},
			'16_9': {
				h: 9,
				w: 16
			},
			'3_1': {
				h: 1,
				w: 3
			},
			'5_1': {
				h: 1,
				w: 5
			}
		},
		MATHROUND = Math.round,
		ref_h = (aspects[format] ? aspects[format].h : 3),
		ref_w = (aspects[format] ? aspects[format].w : 4),
		refHeight,
		boxPosition = function (elm) {
			var b = elm.getBoundingClientRect();
			return {
				'h': b.height,
				'w': b.width
			};
		},
		heightFromAspectRatio = function (p) {
			return MATHROUND((p.refH / p.refW) * p.w);
		},
		setRefHeight = function () {
			/*Get width of rss_widget and apply selected aspect to get a scaled reference height for the content*/
			var width = boxPosition(refElm).w;
			refHeight = heightFromAspectRatio({
				refH: ref_h,
				refW: ref_w,
				w: width
			});
		};

	return {
		init: function () {
			setRefHeight();
		},
		getHeight: function () {
			return refHeight;
		}

	};
};

},{}],8:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 
 */
module.exports = function (params) {
	"use strict";

	var containerElm = params.container,
		item = (params.items || params.item),
		itemsToDisplay = params.items_to_display || 1,
		elements = {
			'item': []
		},
		li = function (item) {
			var wrap = document.createElement('li'),
				category = document.createElement('h1'),
				title = document.createElement('h2'),
				description = document.createElement('article'),
				pubdate = document.createElement('p');
			elements.item.push({
				'wrap': wrap,
				'category': category,
				'title': title,
				'description': description,
				'pubdate': pubdate
			});
			if (item.category) {
				wrap.appendChild(category);
				category.innerText = item.category;
				category.className = 'rss_category';
			}
			if (item.title) {
				wrap.appendChild(title);
				title.innerText = item.title;
				title.className = 'rss_title';
			}
			if (item.pubDate) {
				wrap.appendChild(pubdate);
				pubdate.innerText = item.pubDate;
				pubdate.className = 'rss_pubdate';
			}
			if (item.link) {
				wrap.setAttribute('rel', item.link);
			}
			try {
				wrap.appendChild(description);
				description.innerHTML = item.description;
				description.className = 'rss_description';
			} catch (e) {
				console.log('item_factory:54: rss format uncomplete:' + e);
			}
			wrap.className = 'rss_item';
			return wrap;
		},
		appendList = function (elm) {
			/*go through the rss array of items and create html for each.
			Clone end elements to the opposite ends to create endless slider.
			*/
			var L = item.length,
				firstItem = item[0],
				lastItem = item[L - 1],
				i,
				j;
			for (i = 0; i < itemsToDisplay; i += 1) {
				elm.appendChild(li(item[L - 1 - i]));
			}
			item.forEach(function (item, index) {
				elm.appendChild(li(item));
			});
			for (j = 0; j < itemsToDisplay; j += 1) {
				elm.appendChild(li(item[j]));
			}
			return elm;
		},
		clearContainer = function () {
			if (containerElm.childNodes.length > 0) {
				while (containerElm.firstChild) {
					containerElm.removeChild(containerElm.firstChild);
				}
			}
		},
		createWrapperFragment = function () {
			var docf = document.createDocumentFragment();
			appendList(docf);
			return docf;
		};

	return {
		init: function () {
			clearContainer();
			containerElm.appendChild(createWrapperFragment());
		},
		getElements: function () {
			return elements;
		}

	};
};

},{}],9:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 	
 */
module.exports = function (params) {
	"use strict";

	var elements = params.elements,
		refH,
		setHeight = function (item) {
			item.style.height = refH + 'px';
		};

	return {
		init: function () {
			/*init*/
		},
		update: function (h) {
			refH = h;
			try {
				elements.item.forEach(function (elm) {
					setHeight(elm.wrap);
				});
			} catch (e) {
				console.log('item_resize:update:28:' + e);
			}

		}

	};
};

},{}],10:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 	
 */
module.exports = function (params) {
	"use strict";

	var element = params.element,
		steps = params.steps,
		stepsize = params.stepsize,
		scrollMax = (steps - 0) * stepsize,
		scrollMin = stepsize,
		currentScroll = 0,
		scrollSlider = function () {
			if (Math.abs(currentScroll) > scrollMax) {
				element.style.top = currentScroll + 'px';
				setTimeout(function () {
					element.style.transitionDuration = '0ms';
					scrollToTop();
					setTimeout(function () {
						element.style.transitionDuration = '250ms';
					}, 251);
				}, 251);
			} else if (Math.abs(currentScroll) < scrollMin) {
				element.style.top = currentScroll + 'px';
				setTimeout(function () {
					element.style.transitionDuration = '0ms';
					scrollToEnd();
					setTimeout(function () {
						element.style.transitionDuration = '250ms';
					}, 251);
				}, 251);
			} else {
				element.style.top = currentScroll + 'px';
			}
		},
		scrollToEnd = function () {
			currentScroll = -scrollMax;
			scrollSlider();
		},
		scrollToSecond = function () {
			currentScroll = -2 * stepsize;
			scrollSlider();
		},
		scrollToTop = function () {
			currentScroll = -stepsize;
			scrollSlider();
		},
		skipToNext = function () {
			currentScroll -= stepsize;
			scrollSlider();
		},
		skipToPrevious = function () {
			currentScroll += stepsize;
			scrollSlider();
		};

	return {
		init: function () {
			scrollToTop();
		},
		next: function () {
			skipToNext();
		},
		prev: function () {
			skipToPrevious();
		}

	};
};

},{}],11:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 	
 */
module.exports = function (params) {
	"use strict";

	var elements = params.elements,
		itemsToDisplay = params.items_to_display,
		refH,
		viewport,
		setHeight = function (item, h) {
			item.style.height = h + 'px';
		},
		positionButtons = function () {
			elements.nextbtn.style.top = (0.5 * itemsToDisplay * refH) + 'px';
			elements.prevbtn.style.top = (0.5 * itemsToDisplay * refH) + 'px';
		},
		setViewportHeight = function () {
			setHeight(viewport, (refH * itemsToDisplay));
		};

	return {
		init: function () {
			viewport = elements.viewport;
		},
		update: function (h) {
			refH = h;
			setViewportHeight();
			positionButtons();
		}

	};
};

},{}],12:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global module, require*/
/*
 return <document fragment>
 */
module.exports = function (params) {
	"use strict";
	var containerElm = params.container,
		elements = {
			'wrap': '',
			'viewport': '',
			'items': '',
			'nextbtn': '',
			'prevbtn': ''
		},
		createWrapperFragment = function () {
			/* 
			Output:
			<div class="rss_wrap">
				<div class="fkn_rss_viewport rss_viewport">
					<ol class="fkn_rss_items rss_wrap">
					</ol>
				</div>
				<button class="fkn_rss_next rss_next">next:id:' + id + '</button>
				<button class="fkn_rss_prev rss_prev">prev:id:' + id + '</button>
			</div>
			*/
			var docf = document.createDocumentFragment(),
				elms = elements;
			elms.wrap = document.createElement('div');
			elms.wrap.className = 'rss_wrap';
			docf.appendChild(elms.wrap);
			elms.viewport = document.createElement('div');
			elms.viewport.className = 'rss_viewport';
			elms.items = document.createElement('ul');
			elms.items.className = 'rss_items';
			elms.nextbtn = document.createElement('button');
			elms.nextbtn.className = 'rss_nextbtn';
			elms.nextbtn.innerText = 'V';
			elms.prevbtn = document.createElement('button');
			elms.prevbtn.className = 'rss_prevbtn';
			elms.prevbtn.innerText = 'V';
			elms.wrap.appendChild(elms.viewport);
			elms.viewport.appendChild(elms.items);
			elms.wrap.appendChild(elms.nextbtn);
			elms.wrap.appendChild(elms.prevbtn);
			return docf;
		};

	return {
		init: function () {
			containerElm.appendChild(createWrapperFragment());
		},
		getElements: function () {
			return elements;
		}
	};
};

},{}],13:[function(require,module,exports){
/*jslint browser: true, devel:true */
/*global require*/
var actions = require('./lib/actions'),
	constants = require('./lib/constants'),
	dispatcher = require('./lib/dispatcher'),
	rsslist_store = require('./lib/rsslist_store'),
	slider_viewcontrol = require('./lib/slider_viewcontrol');

/*The function below counts the number of elements with class 'rss_widget' that exists and gets configuration given in the 'rel' and 'items' attributes.
 *example:
 *<div class='rss_widget' items='4' rel='http://www.aftonbladet.se/rss.xml'></div>
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
			var allRssContainers = nodelistAsArray('.rss_widget');
			allRssContainers.forEach(function (elm, index) {
				var sliderViewcontrol = slider_viewcontrol({
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
				viewControl[index] = sliderViewcontrol;
				sliderViewcontrol.init();
				rss_stores.push(rssStore);
				rssStore.init();
			});
		};
	countElementsAndInitRss();
	/*the rss-widget may be updated together or individually.*/
	actions.update('all');
}());

},{"./lib/actions":1,"./lib/constants":2,"./lib/dispatcher":3,"./lib/rsslist_store":4,"./lib/slider_viewcontrol":5}]},{},[13]);

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

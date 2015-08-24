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

	var update = function () {
		console.log('main:tiemout');
		actions.update('all');
	};
	setTimeout(update, 1000);
	// setTimeout(update, 5000);
}());

/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher'),
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
				format: '16_9'
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
		replaceList = function () {
			var itemlist,
				steps;
			try {
				itemlist = (data.state.query.results.rss.channel.item || data.state.query.results.feed.entry);
			} catch (e) {
				console.log('slider_viewcontrol:124: rss format is not supported.' + e);
			}
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
		},
		controlListHeight = function () {
			widgetResize.update(heightScale.getHeight());
			itemResize = item_resize({
				elements: itemFactory.getElements()
			});
			itemResize.init();
			itemResize.update(heightScale.getHeight());	
		},
		addListeners = function () {
			elements.nextbtn.addEventListener('click', function () {
				console.log(id);
				slideElement.next();
			});
			elements.prevbtn.addEventListener('click', function () {
				console.log(id);
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
			/*Control the size of the list*/
			controlListHeight();
			/*
			widgetResize.update(heightScale.getHeight());
			itemResize = item_resize({
				elements: itemFactory.getElements()
			});
			itemResize.init();
			itemResize.update(heightScale.getHeight());
			*/
			
			/*Attach slider functionality*/
			steps = itemlist.length / itemsToDisplay;
			slideElement = slide_element({
				element: elements.items,
				stepsize: (itemsToDisplay * heightScale.getHeight()),
				steps: steps
			});
			slideElement.init();
		}
	};
};

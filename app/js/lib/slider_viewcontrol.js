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

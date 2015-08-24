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
			console.log('widget_resize:setViewportHeight');
			setHeight(viewport, (refH * itemsToDisplay));
		};

	return {
		init: function () {
			console.log('widget_resize:init');
			console.log(params);
			// console.dir(elements);
			viewport = elements.viewport;
			// setRefHeight();
		},
		update: function (h) {
			refH = h;
			console.log('widget_resize:update:' + refH);
			console.dir(elements);
			// elements.viewport.style.height = '240px';
			setViewportHeight();
			positionButtons();
		}

	};
};

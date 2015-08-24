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

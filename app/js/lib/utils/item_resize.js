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
			// console.log('item_resize:init');
			// console.dir(elements);
		},
		update: function (h) {
			console.log('item_resize:update:' + h);
			refH = h;
			console.dir(elements);
			try {
				elements.item.forEach(function (elm) {
					// console.dir(elm);
					setHeight(elm.wrap);
				});

			} catch (e) {
				console.log('item_resize:update:28:' + e);
			}

		}

	};
};

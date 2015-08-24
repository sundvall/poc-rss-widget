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

/*jslint browser: true, devel:true */
/*global module, require*/
/*
 	
 */
module.exports = function (params) {
	"use strict";

	var refElm = params.ref_elm,
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
			}
		},
		format = (params.format || '4_3'),
		// itemsToDisplay = params.items_to_display,
		MATHROUND = Math.round,
		ref_h = (aspects[format].h || 3),
		ref_w = (aspects[format].w || 4),
		refHeight,
		// id = params.id,
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
			// console.log('height_control:init');
			// console.dir(params);
			setRefHeight();
		},
		getHeight: function () {
			return refHeight;
		}

	};
};

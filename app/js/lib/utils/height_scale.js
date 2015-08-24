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

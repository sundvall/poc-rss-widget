/*jslint browser: true, devel:true */
/*global module, require*/
/*
 	
 */
module.exports = function (params) {
	"use strict";

	var element = params.element,
		steps = params.steps,
		stepsize = params.stepsize,
		scrollMax = (steps - 0) * stepsize,
		scrollMin = stepsize,
		currentScroll = 0,
		scrollSlider = function () {
			if (Math.abs(currentScroll) > scrollMax) {
				element.style.top = currentScroll + 'px';
				setTimeout(function () {
					element.style.transitionDuration = '0ms';
					scrollToTop();
					setTimeout(function () {
						element.style.transitionDuration = '250ms';
					}, 251);
				}, 251);
			} else if (Math.abs(currentScroll) < scrollMin) {
				element.style.top = currentScroll + 'px';
				setTimeout(function () {
					element.style.transitionDuration = '0ms';
					scrollToEnd();
					setTimeout(function () {
						element.style.transitionDuration = '250ms';
					}, 251);
				}, 251);
			} else {
				element.style.top = currentScroll + 'px';
			}
		},
		scrollToEnd = function () {
			currentScroll = -scrollMax;
			scrollSlider();
		},
		scrollToSecond = function () {
			currentScroll = -2 * stepsize;
			scrollSlider();
		},
		scrollToTop = function () {
			currentScroll = -stepsize;
			scrollSlider();
		},
		skipToNext = function () {
			currentScroll -= stepsize;
			scrollSlider();
		},
		skipToPrevious = function () {
			currentScroll += stepsize;
			scrollSlider();
		};

	return {
		init: function () {
			scrollToTop();
		},
		next: function () {
			skipToNext();
		},
		prev: function () {
			skipToPrevious();
		}

	};
};

/*jslint browser: true, devel:true */
/*global module, require*/
/*
 	
 */
module.exports = function (params) {
	"use strict";

	var element = params.element,
		steps = params.steps,
		stepsize = params.stepsize,
		scrollMax = (steps - 1) * stepsize,
		scrollMin = stepsize,
		currentScroll = 0,
		scrollSlider = function () {
			console.log('scrollSlider:' + currentScroll + ' max:' + scrollMax + ' scrollMin:' + scrollMin);
			if (Math.abs(currentScroll) > scrollMax) {
				setTimeout(scrollToTop(), 500);
			} else if (Math.abs(currentScroll) < scrollMin) {
				setTimeout(scrollToBottom(), 500);
			}
			element.style.top = currentScroll + 'px';
		},
		scrollToBottom = function () {
			currentScroll = -scrollMax; //*itemsToDisplay
			scrollSlider();
		},
		scrollToTop = function () {
			currentScroll = -stepsize; //*itemsToDisplay
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
			console.log('slide_element:init');
			console.log(params);
			scrollToTop();
		},
		next: function () {
			console.log('slide_element:next');
			skipToNext();
		},
		prev: function () {
			console.log('slide_element:prev');
			skipToPrevious();
		}

	};
};

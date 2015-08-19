/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher');
// events = require('events').EventEmitter;
// events = require('events'),
// eventEmitter = new events.EventEmitter();
// slider_store = require('.slider_store');

// NS = {};
module.exports = function (params) {
	"use strict";
	// var maker = (function () {
	var itemsToDisplay = params.items || 3,
		containerElm = params.container,
		id = params.id,
		rssContainerElm,
		buttonElm,
		urlToRss = params.url,
		state = {
			'type': 'json formatted rss flow'
		};

	return {
		init: function () {
			console.log('slider_view:init');
			var html = '';
			html += '<h1>rss init:' + itemsToDisplay + '</h1>';
			html += '<ol class="rss_wrap">';
			html += '</ol>';
			html += '<button>update:id:' + id + '</button>';
			html += '</div>';
			containerElm.innerHTML = html;
			rssContainerElm = containerElm.querySelector('ol');
			containerElm.style.border = '2px solid black';
			buttonElm = containerElm.querySelector('button');
			buttonElm.addEventListener('click', function () {
				console.log(id);
				actions.update(id);
			});

		},
		update: function (data) {
			/*get state from store*/
			console.log('slider_view:update:' + data.id);
			// console.dir(data);
			var i = 0,
				html = '';
			for (i = 0; i < itemsToDisplay; i += 1) {
				html += data.items[i].description;
			}
			rssContainerElm.innerHTML = html;

			// getListAndRender();
		},
		getState: function () {
			return state;
		}
	};

	// }());
	// return maker;
};

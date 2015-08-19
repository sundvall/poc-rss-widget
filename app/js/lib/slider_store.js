/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher'),
	NS = {};
NS.OBJECTMAKER = function (params) {
	"use strict";
	var maker = (function () {
		var itemsToDisplay = params.items || 3,
			urlToRss = params.url,
			dispatchToken,
			state = {
				'type': 'json formatted rss flow'
			},
			ajaxAndRespondHandler = function (requestUrl, handler) {
				var fkn_ajaxsetup = new XMLHttpRequest();
				fkn_ajaxsetup.open('GET', requestUrl);
				fkn_ajaxsetup.onload = handler;
				fkn_ajaxsetup.send();
			},
			crossDomainRequest = function (xmlOrJson) {
				var yahooApi = 'http://query.yahooapis.com/v1/public/yql?q=';
				return yahooApi + encodeURIComponent('select * from ' + xmlOrJson + ' where url=\"' + urlToRss + '\"') + '&format=json';
			},
			responseHandler = function () {
				console.log('emit change');
				state = JSON.parse(this.response);
				console.log(JSON.parse(this.response));
			},
			nextItem = function () {
				console.log('slider_store:nextItem');
			},
			registerFluxActionHandlers = function () {
				dispatchToken = dispatcher.register(function (action) {
					if (action.type === constants.NEXT) {
						console.log('slider_store:' + action.type);
						nextItem();
					} else if  (action.type === constants.UPDATE) {
						console.log('slider_store:' + action.type);
						//wait for rsslist to update and then render the elements
					}
				});
			};

		return {
			init: function () {
				registerFluxActionHandlers();
			},
			update: function () {
				getListAndRender();
			},
			getState: function () {
				return state;
			}
		};

	}());
	return maker;
};
module.exports = NS.OBJECTMAKER;

/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher'),
	events = require('events'),
	eventEmitter = new events.EventEmitter();
// slider_store = require('.slider_store');

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
				eventEmitter.emit('change');
			},
			getListAndRender = function () {
				ajaxAndRespondHandler(crossDomainRequest('xml'), responseHandler);
			},
			registerFluxActionHandlers = function () {
				dispatchToken = dispatcher.register(function (action) {
					if (action.type === constants.UPDATE) {
						console.log('store:' + action.type);
						getListAndRender();
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

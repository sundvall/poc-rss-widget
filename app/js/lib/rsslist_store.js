/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{items:N,url:'...url.to.rss..}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher');

module.exports = function (params) {
	"use strict";
	var	urlToRss = params.url,
		dispatchToken,
		viewcontrol = params.viewcontrol,
		id = params.id,
		state = {
			'type': 'json formatted rss flow'
		},
		emitChange = function () {
			console.log('rsslist_store:emitChange:state:');
			// console.dir(state);
			viewcontrol[id].update({
				'from': 'rsslist_store',
				'id': id,
				'state': state
			});
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
			// console.log('emit change');
			state = JSON.parse(this.response);
			// console.log(JSON.parse(this.response));
			emitChange();
		},
		getListAndRender = function () {
			ajaxAndRespondHandler(crossDomainRequest('xml'), responseHandler);
		},
		registerFluxActionHandlers = function () {
			dispatchToken = dispatcher.register(function (action) {
				/*if an id is provided only update the specific store and view*/
				if (action.type === constants.UPDATE) {
					if (action.id === id || action.id === 'all') {
						getListAndRender();
					}
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
};

/*jslint browser: true, devel:true */
/*global module, require*/
/*
 *Input: params{id:num}
 */
var actions = require('./actions'),
	constants = require('./constants'),
	dispatcher = require('./dispatcher'),
	events = require('events'),
	eventEmitter = new events.EventEmitter();

module.exports = function (params) {
	"use strict";
	var	dispatchToken,
		viewcontrol = params.viewcontrol,
		id = params.id,
		state = {
			'type': 'current in view'
		},
		handleNext = function (data) {
			viewcontrol[id].next({
				'id': id,
				'data':'next'
			});
		},
		handlePrev = function (data) {
			viewcontrol[id].prev({
				'id': id,
				'data':'previous'
			});
		},
		registerFluxActionHandlers = function () {
			dispatchToken = dispatcher.register(function (action) {
				/*if an id is provided only update the specific store and view*/
				if (action.type === constants.NEXT) {
					if (action.id === id) {
						handleNext(action.data);
					}
				}
				if (action.type === constants.PREV) {
					if (action.id === id) {
						handlePrev(action.data);
					}
				}
			});
		};

	return {
		init: function () {
			registerFluxActionHandlers();
		},
		getState: function () {
			return state;
		}
	};
};

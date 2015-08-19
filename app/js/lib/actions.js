/*jslint browser: true, devel:true */
/*global module,require*/

var dispatcher = require("./dispatcher"),
	constants = require("./constants");

module.exports = {
	prev: function (id, data) {
		"use strict";
		dispatcher.dispatch({
			type: constants.PREV,
			id: id,
			data: data
		});
	},
	next: function (id, data) {
		"use strict";
		dispatcher.dispatch({
			type: constants.NEXT,
			id: id,
			data: data
		});
	},
	update: function (id,data) {
		"use strict";
		dispatcher.dispatch({
			type: constants.UPDATE,
			id: id,
			data: data
		});
	}
};

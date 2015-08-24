/*jslint browser: true, devel:true */
/*global module*/


/**
 This module is a transcription to ES5 of the facebook version for ES6.
https://github.com/facebook/flux/blob/master/src/Dispatcher.js
 */

module.exports = (function () {
	'use strict';
	var callbacks = {
		/*'dispatchToken': 'TPayload'*/
	},
		prefix = 'ID_',
		isDispatching = false,
		isHandled = {
			/*'dispatchToken': false*/
		},
		isPending = {
			/*'dispatchToken': false*/
		},
		lastID = 1,
		pendingPayload = 'TPayload',
		invokeCallback = function (dispatchToken) {
			/**
			 * Call the callback stored with the given id. Also do some internal
			 * bookkeeping.
			 *
			 * @internal
			 */
			isPending[dispatchToken] = true;
			callbacks[dispatchToken](pendingPayload);
			isHandled[dispatchToken] = true;
		},
		startDispatching = function (TPayload) {
			/**
			 * Set up bookkeeping needed when dispatching.
			 *
			 * @internal
			 */
			Object.keys(callbacks).forEach(function (disp_token) {
				isPending[callbacks[disp_token]] = false;
				isHandled[callbacks[disp_token]] = false;
			});
			pendingPayload = TPayload;
			isDispatching = true;
		},
		stopDispatching = function () {
			/**
			 * Clear bookkeeping used for dispatching.
			 *
			 * @internal
			 */
			// delete pendingPayload;
			pendingPayload = null;
			isDispatching = false;
		};

	return {
		register: function (TPayload) {
			/**
			 * Registers a callback to be invoked with every dispatched payload. Returns
			 * a token that can be used with `waitFor()`.
			 */
			var nextID = lastID + 1,
				dispatchToken = prefix + nextID;
			lastID = nextID;
			callbacks[dispatchToken] = TPayload;
			return dispatchToken;
		},
		unregister: function (dispatchToken) {
			/**
			 * Removes a callback based on its token.
			 */
			/*invariant(
				this.callbacks[id],
				'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
				id
			);*/
			try {
				delete callbacks[dispatchToken];
			} catch (e) {
				console.log('could not unregister from dispatcher:' + e);
			}

		},
		dispatch: function (TPayload) {
			// invariant(!this.isDispatching,
			if (isDispatching) {
				console.error('Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.');
			} else {
				startDispatching(TPayload);
				try {
					Object.keys(callbacks).forEach(function (disp_token) {
						if (!isPending[callbacks[disp_token]]) {
							invokeCallback(disp_token);
						}
					});
				} finally {
					stopDispatching();
				}
			}
		},
		isDispatching: function () {
			/**
			 * Is this Dispatcher currently dispatching.
			 */
			return isDispatching;
		},
		waitFor: function (array_of_dispatchTokens) {
			/**
			 * Waits for the callbacks specified to be invoked before continuing execution
			 * of the current callback. This method should only be used by a callback in
			 * response to a dispatched payload.
			 */
			var idsLength = array_of_dispatchTokens.length,
				ii = 0,
				id,
				ids;
			if (isDispatching) {
				console.warn('Dispatcher.waitFor(...): Must be invoked while dispatching.');
			} else {
				for (ii = 0; ii < idsLength; ii += 1) {
					id = ids[ii];
					if (!isPending[id]) {
						callbacks[id]();
					}
				}
			}
		},
		print : function () {
			console.log('dispatcher:print:');
			console.dir(callbacks);
		}


	};
}());

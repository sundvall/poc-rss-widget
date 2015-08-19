/*jslint browser: true, devel:true */
/*global module*/


/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
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
						console.log('dispatcher: token:' + disp_token);
						// console.dir(callbacks[disp_token]);
						// callbacks[disp_token]();
						
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
			/*waitFor(ids: Array < DispatchToken > ): void {
				invariant(
					this.isDispatching,
					'Dispatcher.waitFor(...): Must be invoked while dispatching.'
				);
				for (var ii = 0; ii < ids.length; ii++) {
					var id = ids[ii];
					if (this.isPending[id]) {
						invariant(
							this.isHandled[id],
							'Dispatcher.waitFor(...): Circular dependency detected while ' +
							'waiting for `%s`.',
							id
						);
						continue;
					}
					invariant(
						this.callbacks[id],
						'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
						id
					);
					this.invokeCallback(id);
				}
			}*/
		},
		print : function () {
			console.log('dispatcher:print:');
			console.dir(callbacks);
		}


	};
}());

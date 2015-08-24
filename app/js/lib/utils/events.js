/*jslint browser: true, devel:true */
/*global module, CustomEvent*/
module.exports = function (params) {
	"use strict";
	
	var containsWord = function (string, word) {
		return new RegExp('\\b' + word + '\\b').test(string);
	},
		checkParentForFilterHit = function (element, filter, addFilter) {
			var node = element,
				additionalFilterHit = false,
				parentNode = node.parentNode,
				className = element.className,
				wrapFilterHit = false,
				wrapFilter = 'KF04RZ211adcont',
				seq = 0,
				parentTargetHit = false;
			while (parentNode !== null && !(seq > 15 || wrapFilterHit || parentTargetHit)) {
				node = parentNode;
				className = parentNode.className;
				parentTargetHit = containsWord(className, filter);
				wrapFilterHit = containsWord(className, wrapFilter);
				if (!additionalFilterHit) {
					additionalFilterHit = containsWord(className, addFilter);
				}
				seq += 1;
				parentNode = node.parentNode;
			}
			return {
				'filterHit': parentTargetHit,
				'targetElem': node,
				'className': className
			};
		},
		handle = function (e, classSelectorFilter, sendFkn, checkParent) {
			var handle = (function () {
				e = e || window.event;
				var targetElem = e.target || e.srcElement,
					filterHit = false,
					className = targetElem.className,
					data = e.detail,
					checkParentObj,
					filterClassName = classSelectorFilter.slice(1);
				filterHit = containsWord(className, filterClassName);
				if (!filterHit && checkParent) {
					checkParentObj = checkParentForFilterHit(targetElem, filterClassName);
					filterHit = checkParentObj.filterHit;
					className = checkParentObj.className;
					targetElem = checkParentObj.targetElem;
				}
				if (filterHit && sendFkn) {
					sendFkn({
						'elm': targetElem,
						'data': data,
						'e': e
					});
				}
				return {
					getEventObj: function () {
						return {
							'className': className,
							'data': data,
							'filterHit': filterHit,
							'filter': filterClassName
						};
					}
				};
			}());
			return handle;
		},
		startListening = function (parentElement, eventType, eventHandler) {
			if (parentElement.addEventListener) {
				parentElement.addEventListener(eventType, eventHandler, false);
			} else if (parentElement.attachEvent) {
				eventType = "on" + eventType;
				parentElement.attachEvent(eventType, eventHandler);
			} else {
				parentElement["on" + eventType] = eventHandler;
			}
		};

	return {
		add: function (parentElm, eventType, eventHandler) {
			startListening(parentElm, eventType, eventHandler);
		},
		handle: function (event, classSelectorFilter, sendFkn, checkParentFilterHit) {
			return handle(event, classSelectorFilter, sendFkn, checkParentFilterHit);
		}
	};
};
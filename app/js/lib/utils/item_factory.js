/*jslint browser: true, devel:true */
/*global module, require*/
/*
 
 */
module.exports = function (params) {
	"use strict";

	var containerElm = params.container,
		item = (params.items || params.item),
		itemsToDisplay = params.items_to_display || 1,
		elements = {
			'item': []
		},
		li = function (item) {
			var wrap = document.createElement('li'),
				category = document.createElement('h1'),
				title = document.createElement('h2'),
				description = document.createElement('article'),
				pubdate = document.createElement('p');
			elements.item.push({
				'wrap': wrap,
				'category': category,
				'title': title,
				'description': description,
				'pubdate': pubdate
			});
			if (item.category) {
				wrap.appendChild(category);
				category.innerText = item.category;
				category.className = 'rss_category';
			}
			if (item.title) {
				wrap.appendChild(title);
				title.innerText = item.title;
				title.className = 'rss_title';
			}
			if (item.pubDate) {
				wrap.appendChild(pubdate);
				pubdate.innerText = item.pubDate;
				pubdate.className = 'rss_pubdate';
			}
			if (item.link) {
				wrap.setAttribute('rel', item.link);
			}
			try {
				wrap.appendChild(description);
				description.innerHTML = item.description;
				description.className = 'rss_description';
			} catch (e) {
				console.log('item_factory:54: rss format uncomplete:' + e);
			}
			wrap.className = 'rss_item';
			return wrap;
		},
		appendList = function (elm) {
			/*go through the rss array of items and create html for each.
			Clone end elements to the opposite ends to create endless slider.
			*/
			// console.dir(item);
			var L = item.length,
				firstItem = item[0],
				lastItem = item[L - 1],
				i,
				j;
			// elm.appendChild(li(lastItem));
			for (i = 0; i < itemsToDisplay; i += 1) {
				console.log('appendToBegin:' + i);
				elm.appendChild(li(item[L - 1 - i]));
			}
			item.forEach(function (item, index) {
				elm.appendChild(li(item));
			});
			for (j = 0; j < itemsToDisplay; j += 1) {
				console.log('appendToEnd:' + j);
				elm.appendChild(li(item[j]));
			}
			// elm.appendChild(li(firstItem));
			return elm;
		},
		clearContainer = function () {
			if (containerElm.childNodes.length > 0) {
				while (containerElm.firstChild) {
					containerElm.removeChild(containerElm.firstChild);
				}
			}
		},
		createWrapperFragment = function () {
			var docf = document.createDocumentFragment();
			appendList(docf);
			return docf;
		};

	return {
		init: function () {
			console.log('item_factory:init');
			clearContainer();
			containerElm.appendChild(createWrapperFragment());
		},
		getElements: function () {
			return elements;
		}

	};
};

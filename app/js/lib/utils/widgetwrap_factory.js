/*jslint browser: true, devel:true */
/*global module, require*/
/*
 return <document fragment>
 */
module.exports = function (params) {
	"use strict";
	var containerElm = params.container,
		elements = {
			'wrap': '',
			'viewport': '',
			'items': '',
			'nextbtn': '',
			'prevbtn': ''
		},
		createWrapperFragment = function () {
			/* 
			Output:
			<div class="rss_wrap">
				<div class="fkn_rss_viewport rss_viewport">
					<ol class="fkn_rss_items rss_wrap">
					</ol>
				</div>
				<button class="fkn_rss_next rss_next">next:id:' + id + '</button>
				<button class="fkn_rss_prev rss_prev">prev:id:' + id + '</button>
			</div>
			*/
			var docf = document.createDocumentFragment(),
				elms = elements;
			elms.wrap = document.createElement('div');
			elms.wrap.className = 'rss_wrap';
			docf.appendChild(elms.wrap);
			elms.viewport = document.createElement('div');
			elms.viewport.className = 'rss_viewport';
			elms.items = document.createElement('ul');
			elms.items.className = 'rss_items';
			elms.nextbtn = document.createElement('button');
			elms.nextbtn.className = 'rss_nextbtn';
			elms.nextbtn.innerText = 'V';
			elms.prevbtn = document.createElement('button');
			elms.prevbtn.className = 'rss_prevbtn';
			elms.prevbtn.innerText = 'V';
			elms.wrap.appendChild(elms.viewport);
			elms.viewport.appendChild(elms.items);
			elms.wrap.appendChild(elms.nextbtn);
			elms.wrap.appendChild(elms.prevbtn);
			return docf;
		};

	return {
		init: function () {
			containerElm.appendChild(createWrapperFragment());
		},
		getElements: function () {
			return elements;
		}
	};
};

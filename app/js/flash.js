"use strict";

var source = $("#entry-template").html();
var template = Handlebars.compile(source);


var element = document.getElementById('cards');

function rotateCard(btn, word) {
	var $card = $(btn).closest('.card-container');
	myWorker.postMessage({
		task: 'meaning',
		word: word
	});
	if ($card.hasClass('hover')) {
		$card.removeClass('hover');
	} else {
		$card.addClass('hover');
	}
}
$(function() {
	var hash = window.location.hash.substr(1);
	if (hash && localStorage.getItem(hash)) {
		var doc = localStorage.getItem(hash);
		doc = JSON.parse(doc);
		var fileName = doc.fileName;
		if (doc.words) {
			let keys = Object.keys(doc.words);
			for (let i = keys.length - 1; i >= 0; i--) {
				let html = template({
					"word": keys[i],
					"count": doc.words[keys[i]]
				});
				let e = document.createElement('div');
				e.innerHTML = html;

				while (e.firstChild) {
					element.appendChild(e.firstChild);
				}
			}
		}
	} else {
		alert("No words saved for this PDF it seems. Global View coming soon.")
	}

	window.myWorker = new Worker("dict/worker.js");
	var words = "";
	myWorker.onmessage = function(e) {
		if (e.data && e.data.task == "meaning") {
			words = e.data.results.definitions;
			var str = '<table class="table" ><tr><th>Word</th><th>Type</th><th>Meaning</th></tr>';
			for (var i = words.length - 1; i >= 0; i--) {
				str += '<tr><td>' + e.data.word + '</td><td>' + words[i]['part_of_speech'] + '</td><td>' + words[i]['definition'] + '</td></tr>';
			};
			str += '</table>';
			document.getElementById(e.data.word).innerHTML = str;
		} else {
			var str = 'Word not found in dictionary';
			document.getElementById(e.data.word).innerHTML = str;
		}
	};
});
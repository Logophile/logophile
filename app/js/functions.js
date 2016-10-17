const {remote} = require('electron')

const {dialog,Menu, MenuItem} = remote;
// const dialog = remote.require('dialog');


function openFile() {
	dialog.showOpenDialog({
			properties: ['openFile']
		},
		function(fileNames) {
			loadPDF(fileNames[0]);
		})
}

function handleLibrary() {

}

function openRecent() {

}


function handleFonts() {

}

function settings() {
	window.location = "settings.html";
}

function handleFullscreen() {
	if (document.webkitIsFullScreen) {
		document.webkitExitFullscreen();
	} else {
		var el = document.documentElement,
			rfs = el.requestFullScreen || el.webkitRequestFullScreen;
		rfs.call(el);
	}
}

function changePage(inc) {
	if (inc == "next") {
		$('html body').animate({
			scrollTop: window.scrollY + $(window).height()
		}, 200);
	} else if (inc == "back") {
		$('html body').animate({
			scrollTop: window.scrollY + $(window).height()
		}, 200);
	} else if (typeof inc === "number") {
		pdfViewer.currentPageNumber = inc;
	} else if (inc == "end") {
		pdfViewer.currentPageNumber = pdfViewer.pagesCount;
	}
}

function handleZoom(inc) {
	if (inc) {
		pdfViewer.currentScale += 0.1;
	} else {
		pdfViewer.currentScale -= 0.1;
	}
}

function showDialog(id) {
	var dialog = $(id).data('dialog');
	dialog.open();
}

function showCharm(id) {
	var charm = $(id).data("charm");
	if (charm.element.data("opened") === true) {
		charm.close();
	} else {
		charm.open();
	}
}
$(function() {
	showCharm('#bottomCharm');
})


var menu = new Menu();
menu.append(new MenuItem({
	label: 'GetMeaning',
	click: function() {
		getMeaning();
	}
}));
menu.append(new MenuItem({
	label: 'See Flash Cards',
	click: function() {
		getCards();
	}
}));
window.addEventListener('contextmenu', function(e) {
	e.preventDefault();
	menu.popup(remote.getCurrentWindow());
}, false);

var getMeaning = function() {
	var text = window.getSelection().toString();
	if (text === "") {
		alert('select a text first');
	} else {
		myWorker.postMessage({
			task: 'meaning',
			word: text
		});
	}
}

var getCards = function() {
	var fingerprint = PDFJS.currentFingerPrint;
	window.location.href = 'flashcards.html#' + fingerprint;
}

$(function() {
	window.myWorker = new Worker("dict/worker.js");
	var words = "";
	myWorker.onmessage = function(e) {
		if (e.data && e.data.task == "meaning" && e.data.results) {
			updateWord(e.data.word);
			words = e.data.results.definitions;
			var str = '<p>Meaning of the word: ' + e.data.word+'</p><hr>';
			var part1 = '<div class="tabcontrol" id="tab-control"><ul class="tabs">';
			var part2 = '<div class="frames">';
			var defn = {}
			for (var i = words.length - 1; i >= 0; i--) {
				if(!defn.hasOwnProperty(words[i]['part_of_speech'])){
					defn[words[i]['part_of_speech']] = "";
				}
				defn[words[i]['part_of_speech']] += '<p>'+words[i]['definition']+'</p><hr class="thin">';
				
				// str += '<tr><td>' + e.data.word + '</td><td>' + words[i]['part_of_speech'] + '</td><td>' + words[i]['definition'] + '</td></tr>';
			};
			var keys = Object.keys(defn);
			for (var i = keys.length - 1; i >= 0; i--) {
				part1 += '<li><a href="#word'+i+'">'+keys[i]+'</a></li>';
				part2 += '<div class="frame" id="word'+i+'">'+defn[keys[i]]+'</div>';
			}

			str += part1+'</ul>'+part2+'</div></div>';
			document.getElementById('modalword').innerHTML = str;
			showDialog('#dialog');
			 $("#tab-control").tabcontrol();
		} else {
			var str = 'Word not found in dictionary';
			document.getElementById('modalword').innerHTML = str;
			showDialog('#dialog');
		}
	};
});

var updateWord = function(word) {
	var fingerprint = PDFJS.currentFingerPrint;
	var doc = localStorage.getItem(fingerprint) || '{}';
	doc = JSON.parse(doc);
	doc.fileName = PDFJS.pdfName;
	doc.words = doc.words || {};
	if (doc.words.hasOwnProperty(word)) {
		doc.words[word] += 1;
	} else {
		doc.words[word] = 1;
	}
	localStorage.setItem(fingerprint, JSON.stringify(doc));
}

var updateRecent = function(name, url) {
	localStorage.setItem('lastopen', url);
	var books = localStorage.getItem("books") || '{}';
	books = JSON.parse(books);
	var date = Date.now();
	var keys = Object.keys(books).sort() || [];
	if (keys.length >= 5) { //Hold history till only 5th book
		delete books[keys[0]];
	}
	for (var i = keys.length - 1; i >= 0; i--) {
		if (books[keys[i]] && books[keys[i]].url == url) {
			delete books[keys[i]];
		}
	}
	if (name && url) {
		books[date] = {
			"name": name,
			"url": url
		};
	}


	updateRecentUI(books);
	localStorage.setItem("books", JSON.stringify(books));
}
var updateRecentUI = function(books) {
	var keys = Object.keys(books).sort();
	var str = '';
	for (var i = keys.length - 1; i >= 0; i--) {
		str += '<li><a onclick="loadPDF(\'' + books[keys[i]].url + '\')">' + books[keys[i]].name + '</a></li>';
	}
	document.getElementById('recentBooks').innerHTML = str;
}
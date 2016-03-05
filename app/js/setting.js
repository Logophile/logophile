var remote = require('remote')
var app = remote.require('app')
var appData = app.getPath("appData");
var path = require('path');
var fs = require('fs');
//Should be called everytime the app opens

var dir = path.join(appData, 'logophile');
var preloader = document.getElementById('preloader');

function saveDefault() {
	preloader.style.display = "block";
	var backup = JSON.stringify(localStorage);
	fs.writeFile(path.join(dir, 'backup.json'), backup, 'utf8', function(err) {
		preloader.style.display = "none";
		if (err) {
			alert("There was an error saving.Please Contact the dev.");
		} else {
			alert("Backup Created Successfully at "+ path.join(dir, 'backup.json'));
		}
	});
}

function loadDefault() {
	preloader.style.display = "block";
	fs.readFile(path.join(dir, 'backup.json'), (err, data) => {
		preloader.style.display = "none";
		if (err) {
			alert("Backup not found.")
		} else {
			var obj = JSON.parse(data);
			var keys = Object.keys(obj);
			for (var i = keys.length - 1; i >= 0; i--) {
				localStorage.setItem(keys[i],JSON.stringify(obj[keys[i]]));
			}
			alert("Backup Loaded Successfully");
		}
	});
}
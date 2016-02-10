


self.importScripts("mongo.js");
self.addEventListener('message', function(e) {
	if (e.data.task == "start") {
		self.postMessage(self.words[20]);
	} else if(e.data.task == "meaning") {
		var results =[];
		for (var i = self.words.length - 1; i >= 0; i--) {
			if(self.words[i].word == e.data.word){
				results.push(self.words[i])
			}
		};
		self.postMessage({task : "meaning", results: results});
	}
}, false);
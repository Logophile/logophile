self.importScripts("dictionary.js");

self.onmessage = function(e) {
	if (e.data.task == "start") {
		self.postMessage(self.words['a']);
	} else if(e.data.task == "meaning") {
		var results = words[e.data.word.toLowerCase()];
		self.postMessage({task : "meaning", results: results, word: e.data.word});
	}
}
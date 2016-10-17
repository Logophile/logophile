//Minimal PDF rendering and text-selection example using pdf.js by Vivin Suresh Paliath (http://vivin.net)
//This fiddle uses a built version of pdf.js that contains all modules that it requires.
//
//For demonstration purposes, the PDF data is not going to be obtained from an outside source. I will be
//storing it in a variable. Mozilla's viewer does support PDF uploads but I haven't really gone through
//that code. There are other ways to upload PDF data. For instance, I have a Spring app that accepts a
//PDF for upload and then communicates the binary data back to the page as base64. I then convert this
//into a Uint8Array manually. I will be demonstrating the same technique here. What matters most here is
//how we render the PDF with text-selection enabled. The source of the PDF is not important; just assume
//that we have the data as base64.
//
//The problem with understanding text selection was that the text selection code has heavily intertwined
//with viewer.html and viewer.js. I have extracted the parts I need out of viewer.js into a separate file
//which contains the bare minimum required to implement text selection. The key component is TextLayerBuilder,
//which is the object that handles the creation of text-selection divs. I have added this code as an external
//resource.
//
//This demo uses a PDF that only has one page. You can render other pages if you wish, but the focus here is
//just to show you how you can render a PDF with text selection. Hence the code only loads up one page.
//
//The CSS used here is also very important since it sets up the CSS for the text layer divs overlays that
//you actually end up selecting. 
//
//For reference, the actual PDF document that is rendered is available at:
//http://vivin.net/pub/pdfjs/TestDocument.pdf

var scale = 1; //Set this to whatever you want. This is basically the "zoom" factor for the PDF.


function loadPdf(file) {
	PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is
	//missing in the example code for rendering a pdf.

	var pdf = PDFJS.getDocument(file);
	pdf.then(renderPdf);
}

function renderPdf(pdf) {
	pdf.getPage(1).then(renderPage);
}

function renderPage(page) {
	var viewport = page.getViewport(scale);
	var $canvas = jQuery("<canvas></canvas>");

	//Set the canvas height and width to the height and width of the viewport
	var canvas = $canvas.get(0);
	var context = canvas.getContext("2d");
	canvas.height = viewport.height;
	canvas.width = viewport.width;

	//Append the canvas to the pdf container div
	jQuery("#pdfContainer").append($canvas);

	//The following few lines of code set up scaling on the context if we are on a HiDPI display
	var outputScale = getOutputScale();
	if (outputScale.scaled) {
		var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
			(1 / outputScale.sy) + ')';
		CustomStyle.setProp('transform', canvas, cssScale);
		CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

		if ($textLayerDiv.get(0)) {
			CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
			CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
		}
	}

	context._scaleX = outputScale.sx;
	context._scaleY = outputScale.sy;
	if (outputScale.scaled) {
		context.scale(outputScale.sx, outputScale.sy);
	}

	var canvasOffset = $canvas.offset();
	var $textLayerDiv = jQuery("<div />")
		.addClass("textLayer")
		.css("height", viewport.height + "px")
		.css("width", viewport.width + "px")
		.offset({
			top: canvasOffset.top,
			left: canvasOffset.left
		});

	jQuery("#pdfContainer").append($textLayerDiv);

	page.getTextContent().then(function(textContent) {
		var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
		//the page. It is set to page.number - 1.
		textLayer.setTextContent(textContent);

		var renderContext = {
			canvasContext: context,
			viewport: viewport,
			textLayer: textLayer
		};

		page.render(renderContext);
	});
}


loadPdf("welcome.pdf");

const {dialog} = require('electron').remote;
// const dialog = remote.require('dialog');


function openFile() {
	dialog.showOpenDialog({
			properties: ['openFile']
		},
		function(fileNames) {
			loadPdf(fileNames[0]);
		})
}

function handleLibrary() {

}

function openRecent() {

}

function gotoBookmark() {

}

function handleFonts() {

}

function handleFullscreen() {

}

function changePage(){

}

function showCharm(id) {
	var charm = $(id).data("charm");
	if (charm.element.data("opened") === true) {
		charm.close();
	} else {
		charm.open();
	}
}
$(function(){
	showCharm('#bottomCharm');
})

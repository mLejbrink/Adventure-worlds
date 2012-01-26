var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express.createServer(express.logger());

var stateNr = 1;

/**
 * GET request.
 */
app.get('/', function(request, response) {
	if (request.url == '/') {
		servePage(request, response);
	} else {
		stateNr++;
		response.end('' + request.url + ' Statenr: ' + stateNr);
	}
});

/**
 * Serve "first page" to user.
 */
function servePage(request, response) {
	var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    path.exists(filePath, function(exists) {
        if (exists) {
		    fs.readFile(filePath, function(error, content) {
			    if (error) {
				    response.writeHead(500);
				    response.end();
			    } else {
				    response.writeHead(200, { 'Content-Type': 'text/html' });
				
				    var html = "" + content;
				    var rand = "" + getRandomInt(1, 20) + getRandomInt(1, 20);
				    response.end(html.replace('[NUMBER]', rand), 'utf-8');
			    }
		    });
	    } else {
		    response.writeHead(404);
		    response.end();
	    }
    });
}

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
	while(true) {
		console.log("tick");
		sleep(5000);
	}
});

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
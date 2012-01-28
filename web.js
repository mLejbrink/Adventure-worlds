var express = require('express');
var url  = require('url');
var path = require('path');
var fs = require('fs');

var app = express.createServer(/* express.logger() */);

var tamas;
var updates;

/**
 * GET request.
 */
app.get('/', function(request, response) {
	// Split request URL into parts.
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	var action = query['a'];

	// Check how to handle request depending on action.
	if (action == undefined) {
		servePage(request, response);
	} else if (action == 'addtama') {
		addTama(query);
		response.end();
	} else if (action == 'updateclient') {
		updateClient(query, response);
	} else {
		servePage(request, response);
	}
});

/**
 * New tama dropped in world.
 */
function addTama(query) {
	var new_name = query['new_name'];
	if (new_name == '')
		new_name = 'Unknown tama';
		
	tamas.push(new_name);
	updates.push(new_name + ' dropped in world');
		
	console.log('addtama sent, the name is: ' + new_name);
}

/**
 * Update world.
 */
function updateClient(query, response) {
	var nr_of_tamas = parseInt(query['nr_of_tamas']);
	var diff = tamas.length - nr_of_tamas;
	
	//console.log('current nr of tamas: ' + tamas.length);
	//console.log('page nr of tamas: ' + nr_of_tamas);
	//console.log('diff: ' + diff);
	
	// Respond to client with any new tamas.
	var jsonObj = {};
	if (diff > 0) {
		jsonObj = {'new_tamas': []};
		for (i = 0; i < diff; i++) {
			console.log(tamas[nr_of_tamas + i]);
			jsonObj.new_tamas.push({name: tamas[nr_of_tamas + i]});
		}
	}
	response.end(JSON.stringify(jsonObj));
}

/**
 * Update world.
 */
function updateWorld() {
	// do update of world
}

/**
 * Serve "first page" to user.
 */
function servePage(request, response) {
	var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './content/html/index.html';

    path.exists(filePath, function(exists) {
        if (exists) {
		    fs.readFile(filePath, function(error, content) {
			    if (error) {
				    response.writeHead(500);
				    response.end();
			    } else {
				    response.writeHead(200, { 'Content-Type': 'text/html' });
				    response.end(content, 'utf-8');
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
	
	// Initial state.
	tamas = new Array();
	updates = new Array();
	updates.push('The world is empty.');
	
	// Update world within interval.
	setInterval(function(){updateWorld();}, 100);
});

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
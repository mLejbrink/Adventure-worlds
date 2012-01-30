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
	servePage(request, response);
});

/**
 * GET request.
 */
app.get('/srv/', function(request, response) {
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	var action = query['a'];

	if (action == 'addtama') {
		addTama(query, response);
	} else if (action == 'updateclient') {
		updateClient(query, response);
	}
});

/**
 * New tama dropped in world.
 */
function addTama(query, response) {
	var new_name = query['new_name'];
	if (new_name == '')
		new_name = 'Unknown tama';
		
	tamas.push(new_name);
	updates.push(new_name + ' dropped in world.');
	
	response.end();
}

/**
 * Update client browser with what has happened.
 */
function updateClient(query, response) {
	var last_update = parseInt(query['last_update']);
	var u_diff = updates.length - last_update;
	
	var nr_of_tamas = parseInt(query['nr_of_tamas']);
	var t_diff = tamas.length - nr_of_tamas;
	
	// Respond to client with any new tamas and world updates.
	var jsonObj = {};
	if (t_diff > 0  || u_diff > 0) {
		jsonObj = {'new_tamas': [], 'new_updates': [], 'update_nr': updates.length};
		
		for (i = 0; i < t_diff; i++) {
			var new_name = tamas[nr_of_tamas + i];
			jsonObj.new_tamas.push({name: new_name});
		}
		
		for (j = 0; j < u_diff; j++) {
			var new_update = updates[last_update + j];
			jsonObj.new_updates.push({text: new_update});
		}
	}
	response.end(JSON.stringify(jsonObj));
}

/**
 * Update world.
 */
function updateWorld() {
	// Do simple things once in a while.
	for (i = 0; i < tamas.length; i++) {
		if (getRandomInt(1, 100) == 1) {
			if (tamas.length == 1) {
				updates.push(tamas[0] + ' is forever alone.');
			} else {
				updates.push(tamas[i] + ' yawns out of pure boredom.');
			}
		}
	}
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
	updates.push('This world is empty.');
	
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
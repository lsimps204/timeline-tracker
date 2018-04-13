const requests = require('request')
const express = require('express')
const cors = require('cors')

var mergeAuth = require('../../src/AuthHeaders.js');

const app = express()

/* Define middleware */
app.use(cors())
app.use(express.json()); 

const base_url = 'REDACTED - NO LONGER OPERATATIONAL'
headers = {
	'Access-Control-Allow-Origin': '*',
	'AuthToken': 'REDACTED',
	'TenantId': '17'
}


/* Route for fetching all existing timelines */
app.get("/Timeline/GetTimelines", (request, response) => {
	var options = {
		'url': base_url + "/Timeline/GetTimelines",
		'headers': headers
	};
	requests.get(options, (err, res, body) => {
		if (err) return console.log(err);
		return response.send(body);
	});
});

app.get("/Timeline/GetTimeline", (request, response) => {
	let these_headers = headers
	these_headers.TimelineId = request.headers["timelineid"]
	var options = {
		'url': base_url + "/Timeline/GetTimeline",
		'headers': these_headers
	};
	requests.get(options, (err, res, body) => {
		if (err) return console.log(err);
		return response.send(body);
	});
});

/* Route for fetching all events associated with the timeline ID */
app.get("/Timeline/GetEvents", (request, response) => {
	var options = {
		'url': base_url + "/Timeline/GetEvents",
		'headers': headers
	};
	requests.get(options, (err, res, body) => {
		if (err) return console.log(err);
		return response.send(body);
	});
});

/* Route for fetching all events */
app.get("/TimelineEvent/GetAllEvents", (request, response) => {
	var options = {
		'url': base_url + "/TimelineEvent/GetAllEvents",
		'headers': headers
	};
	requests.get(options, (err, res, body) => {
		if (err) return console.log(err);
		return response.send(body);
	});
});

/* Route for fetching all timelines with their events */
app.get("/Timeline/GetAllTimelinesAndEvent", (request, response) => {
	var options = {
		'url': base_url + "/Timeline/GetAllTimelinesAndEvent",
		'headers': headers
	};
	requests.get(options, (err, res, body) => {
		if (err) return console.log(err);
		return response.send(body);
	});
});


/* Route for creating timeline */
app.put('/Timeline/Create', (request, response) => {
	makeChange('/Timeline/Create', 'PUT', request, response)
});

/* Route for editing timeline title */
app.put('/Timeline/EditTitle', (request, response) => {
	makeChange('/Timeline/EditTitle', 'PUT', request, response)
});

/* Route for deleting a timeline */
app.put('/Timeline/Delete', (request, response) => {
	makeChange('/Timeline/Delete', 'PUT', request, response)
});

/* Route for creating an event */
app.put('/TimelineEvent/Create', (request, response) => {
	makeChange('/TimelineEvent/Create', 'PUT', request, response)
})

/* Link an event to a timeline */
app.put('/Timeline/LinkEvent', (request, response) => {
	makeChange('/Timeline/LinkEvent', 'PUT', request, response)
})

/* Delete an event */
app.put('/TimelineEvent/Delete', (request, response) => {
	makeChange('/TimelineEvent/Delete', 'PUT', request, response)
})

/* Create an attachment */
app.put('/TimelineEventAttachment/Create', (request, response) => {
	makeChange('/TimelineEventAttachment/Create', 'PUT', request, response)
})

/* Edit attachment title */
app.put('/TimelineEventAttachment/EditTitle', (request, response) => {
	makeChange('/TimelineEventAttachment/EditTitle', 'PUT', request, response)
})

/* Delete attachment */
app.put('/TimelineEventAttachment/Delete', (request, response) => {
	makeChange('/TimelineEventAttachment/Delete', 'PUT', request, response)
})


app.listen(5000, () => console.log("Node server listening on port 5000..."))


/* Encapsulate the forwarding of PUT requests */
function makeChange(action_url, method, request, response) {
	requests({
		url: base_url + action_url,
		headers: headers,
		method: method,
		json: request.body
	},
	(err,res,body) => {
		if (err) return console.log(err);
		return response.send(body);
	});
}
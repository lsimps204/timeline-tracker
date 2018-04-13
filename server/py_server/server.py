""" 
It's seemingly impossible to enable CORS from the front-end/Axios alone
So for now, we fallback to implementing a 'proxy' server (implemented using Flask) that the Axios client can call
This server will then call the API using the Python requests library, and return the response to Axios
If possible, try and find a solution where Axios/Webpack-dev-server can add the CORS headers
That would maybe eliminate the need for this server file.
"""

from flask import Flask, request
from flask_cors import CORS
import requests, json, datetime

app = Flask(__name__)
CORS(app)

base_url = 'REDACTED - API NO LONGER OPERATIONAL'
headers = {
	'Access-Control-Allow-Origin': '*',
	'AuthToken': 'REDACTED',
	'TenantId': '17'
}

# Get all timelines
@app.route("/Timeline/GetTimelines", methods=['GET'])
def get_timelines():
	response = requests.get(base_url + 'Timeline/GetTimelines', headers=headers)
	return response.text;

# Get individual timeline
@app.route("/Timeline/GetTimeline", methods=['GET'])
def get_timeline():
	response = requests.get(base_url + 'Timeline/GetTimeline', headers=headers)
	return response.text;

# Get all events
@app.route("/TimelineEvent/GetAllEvents", methods=['GET'])
def get_events():
	response = requests.get(base_url + 'TimelineEvent/GetAllEvents', headers=headers)
	return response.text;

# Get all timelines with events
@app.route("/Timeline/GetAllTimelinesAndEvent", methods=['GET'])
def get_timelines_with_events():
	response = requests.get(base_url + 'Timeline/GetAllTimelinesAndEvent', headers=headers)
	return response.text;

# Create a new timeline
@app.route("/Timeline/Create", methods=['PUT'])
def create_timeline():
	requests.put(base_url + 'Timeline/Create', data=request.data, headers=headers)
	return ''

# Delete a timeline
@app.route("/Timeline/Delete", methods=['PUT'])
def delete_timeline():
	res = requests.put(base_url + "Timeline/Delete", data=request.data, headers=headers)
	return res.text 

# Edit a timeline's title
@app.route("/Timeline/EditTitle", methods=['PUT'])
def edit_timeline():
	res = requests.put(base_url + "Timeline/EditTitle", data=request.data, headers=headers)
	return res.text

# Get all events
@app.route("/Timeline/GetEvents", methods=["GET"])
def get_events():
	res = requests.put(base_url + "Timeline/GetEvents", headers=headers)
	return res.text

# Create an event
@app.route('/TimelineEvent/Create', methods=["PUT"])
def create_event():
	res = requests.put(base_url + "TimelineEvent/Create", headers=headers)
	return res.text

# Delete an event
@app.route('/TimelineEvent/Delete', methods=["PUT"])
def delete_event():
	res = requests.put(base_url + "TimelineEvent/Delete", headers=headers)
	return res.text

# Link an event to a timeline
@app.route('/Timeline/LinkEvent', methods=["PUT"])
def link_event():
	res = requests.put(base_url + "Timeline/LinkEvent", headers=headers)
	return res.text

# Create an attachment
@app.route('/TimelineEventAttachment/Create', methods=["PUT"])
def create_attachment():
	res = requests.put(base_url + "TimelineEventAttachment/Create", headers=headers)
	return res.text

# Delete an attachment
@app.route('/TimelineEventAttachment/Delete', methods=["PUT"])
def delete_attachment():
	res = requests.put(base_url + "TimelineEventAttachment/Delete", headers=headers)
	return res.text

# Edit attachment title
@app.route('/TimelineEventAttachment/EditTitle', methods=["PUT"])
def edit_attachment_title():
	res = requests.put(base_url + "TimelineEventAttachment/EditTitle", headers=headers)
	return res.text

if __name__ == '__main__':
	app.run(debug=True)

def covert_ticks(ticks):
	import datetime
	converted_ticks = datetime.datetime.now() + datetime.timedelta(microseconds = ticks/10)
	converted_ticks.strftime("%Y-%m-%d %H:%M:%S") // '2015-08-07 14:17:48'
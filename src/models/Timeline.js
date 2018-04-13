import axios from '../axios.js'

/* The below import is also used in a Node.js context, so relies on module.exports and thus must be required */
let mergeAuthHeaders = require('../AuthHeaders.js')


// API to abstract away the AJAX requests from the Component

class Timeline {
	static all() {
		return axios.get('Timeline/GetTimelines')
	}

	static allWithEvents() {
		return axios.get('Timeline/GetAllTimelinesAndEvent')
	}

	static add(timeline) {
		let body = mergeAuthHeaders(timeline)
		return axios.put('Timeline/Create', body)
	}

	static get(id) {
		return axios.get("Timeline/GetTimeline", {headers: {'TimelineId': id}})
	}

	static delete(timeline) {
		let body = mergeAuthHeaders(timeline)
		return axios.put('Timeline/Delete', body)
	}

	static editTitle(timeline) {
		let body = mergeAuthHeaders(timeline)
		return axios.put('Timeline/EditTitle', body)
	}

	static getEvents(body) {
		return axios.get('Timeline/GetEvents')
	}

	static addEvent(body) {
		let requestBody = mergeAuthHeaders(body)
		return axios.put('Timeline/LinkEvent', requestBody)
	}

	static linkEvent(body) {
		let requestBody = mergeAuthHeaders(body)
		return axios.put('Timeline/LinkEvent', body)
	}


	static unlinkEvent(body) {
		let requestBody = mergeAuthHeaders(body)
		return axios.put('Timeline/UnlinkEvent', requestBody)
	}
}

export default Timeline
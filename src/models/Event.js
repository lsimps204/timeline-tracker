import axios from '../axios.js'

/* The below import is also used in a Node.js context, so relies on module.exports and thus must be required */
let mergeAuthHeaders = require('../AuthHeaders.js')

class Event {
	static all() {
		return axios.get('TimelineEvent/GetAllEvents')
	}

	static createEvent(event) {
		let body = mergeAuthHeaders(event)
		return axios.put('TimelineEvent/Create', body)
	}

	static delete(event) {
		let body = mergeAuthHeaders(event)
		return axios.put('TimelineEvent/Delete', body)
	}

	static deleteAll(events) {
		events.forEach(event => {
			let body = mergeAuthHeaders(event.Id)
			axios.put('TimelineEvent/Delete', body)
		})
	}

	static editTitle(event) {
		let body = mergeAuthHeaders(event)
		return axios.put('TimelineEvent/EditTitle', body)
	}

	static editDate(event) {
		let body = mergeAuthHeaders(event)
		return axios.put('TimelineEvent/EditEventDateTime', body)
	}

	static editDescription(event) {
		let body = mergeAuthHeaders(event)
		return axios.put('TimelineEvent/EditDescription', body)
	}

	static editLocation(event) {
		let body = mergeAuthHeaders(event)
		return axios.put('TimelineEvent/EditLocation', body)
	}

	static linkEvent(eventIds) {
		let body = mergeAuthHeaders(eventIds)
		return axios.put('TimelineEvent/LinkEvents', body)
	}

	static unlinkEvent(eventIds) {
		let body = mergeAuthHeaders(eventIds)
		return axios.put('TimelineEvent/UnlinkEvents', body)
	}
}

export default Event
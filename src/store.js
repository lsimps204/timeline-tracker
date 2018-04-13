import Vue from 'vue'
import Vuex from 'vuex'
import Timeline from './models/Timeline.js';
import Event from './models/Event.js';
import Attachment from './models/Attachment.js';
const uuidv4 = require('uuid/v4') // For generating unique IDs for the timelines

Vue.use(Vuex)

/* Session Storage workflow: 
	1. Check storage before sending any HTTP requests.
	2. Set storage key upon completion of HTTP requests.
	3. Reset storage key upon any changes to state
*/

/**************************************
 * GETTERS
 *   - functions that allow components to retrieve the store's state
 *************************************/
export const getters = {
	timelines(state) {
		return state.timelines;
	},

	numberOfTimelines(state) {
		return state.timelines.length;
	},

	timelineSearchResults: (state, getters) => (Title) => {
		return state.timelines.filter(timeline =>
		 	timeline.Title.search(new RegExp(Title, "gi")) >= 0 
		);

	},

	getTimeline: (state, getters) => (id) => {
		let index = state.timelines.findIndex(timeline => timeline.Id == id);
		return state.timelines[index]
	},

	getEventFromTimeline: (state,getters) => (id) => {
		let evt
		state.timelines.forEach(timeline => {
			timeline.TimelineEvents.forEach(event => {
				if (event.Id == id && !event.IsDeleted) {
					evt = event
				}
			})
		})
		return evt
	},

	getParentTimeline: (state,getters) => (eventId) => {
		let t
		state.timelines.forEach(timeline => {
			timeline.TimelineEvents.forEach(event => {
				if (event.Id == eventId) {
					t = timeline
				}
			})
		})
		return t
	},

	getEvent: (state, getters) => (id) => {
		let index = state.events.findIndex(event => event.Id == id)
		if (!state.events[index].IsDeleted)
			return state.events[index]
	},

	getTimelineEvents: (state,getters) => (timelineId) => {
		let index = state.timelines.findIndex(timeline => timeline.Id == timelineId);
		if (index >= 0) {
			return state.timelines[index].TimelineEvents.filter(e => !e.IsDeleted)
		}
	},

	getAttachments: (state, getters) => (eventId) => {
		let attachmentList;
		state.timelines.forEach(timeline => {
			timeline.TimelineEvents.forEach(event => {
				if (event.Id == eventId) {
					attachmentList = event.Attachments
				}
			})
		})
		return attachmentList || []
	},

	getAttachment: (state,getters) => (attachmentId) => {
		let theAttachment
		state.timelines.forEach(timeline => {
			timeline.TimelineEvents.forEach(event => {
				if (event.hasOwnProperty("Attachments")) {
					event.Attachments.forEach(attachment => {
						if (attachment.Id == attachmentId) {
							theAttachment = attachment
						}
					})
				}
			})
		})
		return theAttachment
	},

	/* Attempts to get the attachment information from the store, instead of sending an HTTP request */
	getAttachmentFromLocalData: (state, getters) => (attachmentId) => {
		let index = state.attachments.findIndex(attachment => attachment.id == attachmentId)
		if (index >= 0) {
			return state.attachments[index]
		}
		return null;
	}
}

/**************************************
 * MUTATIONS 
 *   - for changing the store's state in response to events
 *************************************/
export const mutations = {
	setTimelines(state, payload) {
		state.timelines = payload
		pushToStorage('timelines', payload)
	},

	setTimelinesWithEvents(state, payload) {
		state.timelines = payload
		pushToStorage('timelines', payload)
	},

	addTimeline(state, payload) {
		if (!payload.hasOwnProperty("TimelineEvents")) {
			payload.TimelineEvents = []
		}
		state.timelines.push(payload)
		pushToStorage('timelines', state.timelines)
	},
	deleteTimeline(state, payload) {
		let index = state.timelines.findIndex(timeline => timeline.Id == payload)
		state.timelines.splice(index, 1)
		pushToStorage('timelines', state.timelines)
	},

	changeTimelineTitle(state, editedTimeline) {
		let index = state.timelines.findIndex(timeline => timeline.Id == editedTimeline.Id);
		state.timelines.splice(index, 1, editedTimeline)
		pushToStorage('timelines', state.timelines)
	},

	getEvents(state, payload) {
		payload.forEach(timeline => {
			timeline.TimelineEvents.forEach(e => {
				if (!e.IsDeleted) state.events.push(e)
			})
		})
		pushToStorage('events', state.events)
	},

	createEvent(state, event) {
		state.events.push(event);
		pushToStorage('events', state.events)
	},

	/* Links an event to a parent timeline */
	linkEvent(state, payload) {
		let index = state.timelines.findIndex(timeline => timeline.Id == payload.timelineId)
		if (index >= 0) {
			let timeline = state.timelines[index]
			if (timeline.hasOwnProperty('TimelineEvents')) {
				/* Below: check if the event already exists in its timeline's linked events array */
				if (timeline.TimelineEvents.findIndex(event => event.Id == payload.event.Id) < 0)
					timeline.TimelineEvents.push(payload.event)
			} else {
				timeline.TimelineEvents = [payload.event]
			}
			state.timelines.splice(index,1,timeline)
		}

		pushToStorage('timelines', state.timelines)
	},

	deleteEvent(state, eventId) {
		let id = state.events.findIndex(event => event.Id == eventId)
		state.events.splice(id, 1)
		pushToStorage('events', state.events)
		state.timelines.forEach((timeline, timelineIndex) => {
			if (timeline.TimelineEvents.length) {
				let index = timeline.TimelineEvents.findIndex(event => event.Id == eventId)
				if (index >= 0) {
					timeline.TimelineEvents.splice(index, 1)
					state.timelines.splice(timelineIndex, 1, timeline)
					pushToStorage('timelines', state.timelines)
					return
				}
			}
		})
	},

	editEventTitle(state, payload) {
		let id = state.events.findIndex(event => event.Id == payload.Id)
		let editedEvent = Object.assign({}, state.events[id]) // The cloned event
		editedEvent.Title = payload.Title
		state.events.splice(id, 1, editedEvent)
		pushToStorage('events', state.events)

		state.timelines.forEach((timeline, timelineIndex) => {
			if(timeline.TimelineEvents.length) {
				let index = timeline.TimelineEvents.findIndex(event => event.Id == payload.Id)
				if (index >= 0) {
					timeline.TimelineEvents.splice(index, 1, editedEvent)
					state.timelines.splice(timelineIndex, 1, timeline)
					pushToStorage('timelines', state.timelines)
					return
				}
			}
		})
	},

	editEventDate(state, payload) {
		let id = state.events.findIndex(event => event.Id == payload.Id)
		let editedEvent = Object.assign({}, state.events[id]) // The cloned event
		editedEvent.EventDateTime = payload.EventDateTime
		state.events.splice(id, 1, editedEvent)
		pushToStorage('events', state.events)

		state.timelines.forEach((timeline, timelineIndex) => {
			if(timeline.TimelineEvents.length) {
				let index = timeline.TimelineEvents.findIndex(event => event.Id == payload.Id)
				if (index >= 0) {
					timeline.TimelineEvents.splice(index, 1, editedEvent)
					state.timelines.splice(timelineIndex, 1, timeline)
					pushToStorage('timelines', state.timelines)
					return
				}
			}
		})
	},

	editEventDescription(state, payload) {
		let id = state.events.findIndex(event => event.Id == payload.Id)
		let editedEvent = Object.assign({}, state.events[id]) // The cloned event
		editedEvent.Description = payload.Description
		state.events.splice(id, 1, editedEvent)
		pushToStorage('events', state.events)

		state.timelines.forEach((timeline, timelineIndex) => {
			if(timeline.TimelineEvents.length) {
				let index = timeline.TimelineEvents.findIndex(event => event.Id == payload.Id)
				if (index >= 0) {
					timeline.TimelineEvents.splice(index, 1, editedEvent)
					state.timelines.splice(timelineIndex, 1, timeline)
					pushToStorage('timelines', state.timelines)
					return
				}
			}
		})
	},

	linkEvents(state, payload) {
		/* Mutate store's events array */

		/* Mutate store's timelines array */
		let index = state.timelines.findIndex(timeline => timeline.Id == payload.timelineId)
		let timeline = Object.assign({}, state.timelines[index])
		timeline.TimelineEvents.forEach(event => {
			if (!event.hasOwnProperty("LinkedTimelineEventIds")) event.LinkedTimelineEventIds = []
			if (event.Id == payload.childId) event.LinkedTimelineEventIds.push(payload.parentId)
		})
		state.timelines.splice(index, 1, timeline)
		pushToStorage('timelines', state.timelines)
	},

	editEventLocation(state,payload) {
		let id = state.events.findIndex(event => event.Id == payload.Id)
		let editedEvent = Object.assign({}, state.events[id]) // The cloned event
		editedEvent.Location = payload.Location
		state.events.splice(id, 1, editedEvent)
		pushToStorage('events', state.events)

		state.timelines.forEach((timeline, timelineIndex) => {
			if(timeline.TimelineEvents.length) {
				let index = timeline.TimelineEvents.findIndex(event => event.Id == payload.Id)
				if (index >= 0) {
					timeline.TimelineEvents.splice(index, 1, editedEvent)
					state.timelines.splice(timelineIndex, 1, timeline)
					pushToStorage('timelines', state.timelines)
					return
				}
			}
		})
	},

	addAttachment(state, payload) {
		/* Check event exists. If so, add to the timeline's TimelineEvents array*/
		let id = state.events.findIndex(event => event.Id == payload.TimelineEventId)
		if (id >= 0) {
			state.timelines.forEach((timeline, timelineIndex) => {
				if (timeline.TimelineEvents.length) {
					let index = timeline.TimelineEvents.findIndex(event => event.Id == payload.TimelineEventId)
					if (index >= 0){
						// check attachments array. does it exist?
						if (timeline.TimelineEvents[index].hasOwnProperty('Attachments')) {
							timeline.TimelineEvents[index].Attachments.push(payload)
						} else {
							timeline.TimelineEvents[index].Attachments = [payload]
						}
						state.timelines.splice(timelineIndex,1, timeline)
						pushToStorage('timelines', state.timelines)
						return
					}
				}

			})
		}
	},

	editAttachmentTitle(state, payload) {
		let attachmentId = payload.Id
		let title = payload.Title
		state.timelines.forEach((timeline,timelineIndex) => {
			if (timeline.TimelineEvents.length) {
				timeline.TimelineEvents.forEach((event,eventIndex) => {
					if (event.hasOwnProperty("Attachments")) {
						event.Attachments.forEach((attachment, attachmentIndex) => {
							if (attachment.Id == attachmentId) {
								attachment.Title = title
								timeline.TimelineEvents[eventIndex].Attachments[attachmentIndex] = attachment
								state.timelines.splice(timelineIndex, 1, timeline)
								pushToStorage("timelines", state.timelines)
								return
							}
						})
					}
				})
			}
		})
	},

	/* Deletes an attachment from the store */
	deleteAttachment(state, payload) {
		let attachmentId = payload.id
		state.timelines.forEach((timeline, timelineIndex) => {
			if (timeline.TimelineEvents.length) {
				timeline.TimelineEvents.forEach((event,eventIndex) => {
					if (event.hasOwnProperty("Attachments")) {
						event.Attachments.forEach((attachment, attachmentIndex) => {
							if (attachment.Id == attachmentId) {
								timeline.TimelineEvents[eventIndex].Attachments.splice(attachmentIndex,1)
								state.timelines.splice(timelineIndex, 1, timeline)
								pushToStorage("timelines", state.timelines)
								return
							}
						})
					}
				})
			}
		})
	},

	/* This method is called after the attachment is uploaded. */
	addAttachmentToStorage(state,payload) {
		state.attachments.push(payload)
	},

	editAttachmentInStorage(state,payload) {
		let index = state.attachments.findIndex(attachment => attachment.id == payload.id)
		if (index >= 0) {
			/* Clone object and replace original attachment w/ new title */
			let newAttachment = Object.assign({}, state.attachments[index])
			newAttachment.title = payload.title
			state.attachments.splice(index,1,newAttachment)
		}
	},

	deleteAttachmentInStorage(state,payload) {
		let index = state.attachments.findIndex(attachment => attachment.id == payload.id)
		if (index >= 0) {
			state.attachments.splice(index,1)
		}
	}
}


/**************************************
 * ACTIONS 
 *    - for asynchronous operations such as HTTP requests
 *		Upon completion, each action will call a mutator method to complete the mutation
 *************************************/
export const actions = {
	getAllTimelines({commit}) {
		if(inStorage('timelines')) {
			state.timelines = getFromStorage('timelines');
		} else {
		Timeline.all()
        	.then(response => commit('setTimelines', response.data))
        	.catch(err => console.log(err));
        }
	},

	getAllTimelinesWithEvents({commit,state}) {
		return new Promise((resolve,reject) => {
			if(inStorage('timelines')) {
				state.timelines = getFromStorage('timelines');
				commit('getEvents', state.timelines)
				resolve()
			} else {
			Timeline.allWithEvents()
	        	.then(response => {
					commit('setTimelinesWithEvents', response.data.Timelines)
					commit('getEvents', response.data.Timelines)
	        		resolve()
	        	})
	        	.catch(err => reject());
	        }
	    })
	},

	addTimeline({commit}, payload) {
		return new Promise((resolve,reject) => {
			Timeline.add({
				'TimelineId': uuidv4(),
				'Title': payload.title    
			})
			.then(response => {
				commit('addTimeline', response.data)
				resolve(response.data)
			})
			.catch(err => reject(err));
		})
	},

	deleteTimeline({commit}, payload) {
	    return new Promise((resolve, reject) => {
	    	Timeline.delete({'TimelineId': payload.id })
    		.then(response => {
    			commit('deleteTimeline', payload.id)
    			resolve(response)
    		})
    		.catch(err => reject(err));
    	})   
	},

	// getEvents({commit,state}, payload) {
	// 	return new Promise((resolve, reject) => {
	// 		if (inStorage('events')) {
	// 			state.events = getFromStorage('events')
	// 			resolve()
	// 		} else {
	// 			Event.all()
	// 				.then(response => {
	// 					commit('getEvents', response.data)
	// 					resolve()
	// 				})
	// 				.catch(err => reject(err));
	// 		}
	// 	})
	// },

	/* Edits an existing timeline's title */
	editTitle({commit}, payload) {
        return new Promise((resolve, reject) => {
        	Timeline.editTitle({
	          'TimelineId': payload.id,
	          'Title': payload.title
	        })
	        .then(response => {
	        	commit('changeTimelineTitle', response.data)
	        	resolve(response.data)
	        })
	        .catch(err => reject(err))
	     })
	},

	/* Creates an event, links it to a parent timeline, and creates any links between the event and other events. */
	createEvent({commit, dispatch}, payload) {
		return new Promise((resolve, reject) => {
			let eventId = uuidv4()
			Event.createEvent({
				'TimelineEventId': eventId,
				'Title': payload.title,
				'Description': payload.description,
				'EventDateTime': payload.datetime,
				'Location': payload.location
			})
			.then(response => {
				let event = response.data
				event.LinkedTimelineEventIds = []
				commit('createEvent', event)
				dispatch('linkEvent',{
					'TimelineId': payload.timelineId,
					'Event': event
				}).then(newResponse => {
					resolve(response.data)
				})
			})
			.catch(err => {
				console.log(err)
				reject(err)
			})
		})
	},

	linkEvent({commit}, payload) {
		return new Promise((resolve, reject) => {
			Timeline.linkEvent({
				'TimelineId': payload.TimelineId,
				'EventId': payload.Event.Id
			})
			.then(response => {
				commit('linkEvent', {'timelineId': payload.TimelineId, 'event': payload.Event})
				resolve(response)
			})
			.catch(err => console.log(err))
		})
	},

	deleteEvent({commit}, payload) {
		return new Promise((resolve,reject) => {
			Event.delete({
				'TimelineEventId': payload.id
			}).then(response => {
				commit('deleteEvent', payload.id)
				resolve(response)
			}).catch(err => reject(err))
		})
	},

	editEventTitle({commit}, payload) {
		return new Promise((resolve,reject) => {
			Event.editTitle({
				'TimelineEventId': payload.id,
				'Title': payload.newTitle
			}).then(response => {
				commit('editEventTitle', response.data)
				resolve(response)
			}).catch(err => reject(err))
		})
	},

	editEventDate({commit}, payload) {
		return new Promise((resolve,reject) => {
			Event.editDate({
				'TimelineEventId': payload.id,
				'EventDateTime': payload.datetime
			}).then(response => {
				commit('editEventDate', response.data)
				resolve(response)
			}).catch(err => reject(err))
		})
	},

	editEventDescription({commit}, payload) {
		return new Promise((resolve,reject) => {
			Event.editDescription({
				'TimelineEventId': payload.id,
				'Description': payload.description
			}).then(response => {
				commit('editEventDescription', response.data)
				resolve(response)
			}).catch(err => reject(err))
		})
	},

	editEventLocation({commit}, payload) {
		return new Promise((resolve,reject) => {
			Event.editLocation({
				'TimelineEventId': payload.id,
				'Location': payload.location
			}).then(response => {
				commit('editEventLocation', response.data)
				resolve(response)
			}).catch(err => reject(err))
		})
	},

	/* Creates a link between two events in a given timeline */
	linkEvents({commit}, payload) {
		return new Promise((resolve, reject) => {
			Event.linkEvent({
				'TimelineEventId': payload.childId,
				'LinkedToTimelineEventId': payload.parentId
			}).then(response => {
				commit('linkEvents', payload)
				resolve()
			}).then(err => reject(err))
		})
	},

	addAttachment({commit}, payload) {
		return new Promise((resolve, reject) => {
			Attachment.create({
				'TimelineEventId': payload.TimelineEventId,
				'AttachmentId': uuidv4(),
				'Title': payload.Title
			}).then(response => {
				commit('addAttachment', response.data)
				resolve(response.data)
			}).catch(err => console.log(err))
		})
	},

	editAttachmentTitle({commit}, payload) {
		return new Promise((resolve,reject) => {
			Attachment.editTitle({
				'AttachmentId': payload.id,
				'Title': payload.newTitle
			}).then(response => {
				commit('editAttachmentTitle', response.data)
				resolve(response.data)
			}).catch(err => reject(err))
		})
	},

	deleteAttachment({commit}, payload) {
		return new Promise((resolve, reject) => {
			Attachment.delete({'AttachmentId': payload.id})
			.then(() => {
				commit('deleteAttachment', payload)
				commit('deleteAttachmentInStorage', payload)
				resolve()
			})
			.catch(err => reject(err))
		})
	},

	deleteAll({commit, state}) {
		state.events.forEach(event => {
			Event.delete({'TimelineEventId': event.Id})
			.then(response => commit('deleteEvent', event.Id))
		})
	},
}

/* This store will house all our application state in one place */
export const store = new Vuex.Store({
	state: {
		timelines: [],
		events: [],
		attachments: [],
		unattachedEvents: []
	},

	getters,
	mutations,
	actions,
});


/* Refresh storage and re-perform AJAX request every 20 seconds */
// setInterval(() => {
// 	sessionStorage.clear()
// 	store.dispatch('getAllTimelinesWithEvents')
// 	console.log("working...")
// }, 20000);


/* Store helper functions for dealing with session storage */

/* Pushes new state to storage at 'key', overwriting previous state */
function pushToStorage(key, state) {
	if(typeof sessionStorage != "undefined")
		sessionStorage.setItem(key, JSON.stringify(state))
}

/* Checks if given key exists in storage. Returns true if so, false if not */
function inStorage(key) {
	if(typeof sessionStorage != "undefined")
		return sessionStorage.getItem(key) != null
}

/* Retrieves the value from storage associated with the given key */
function getFromStorage(key) {
	if(typeof sessionStorage != "undefined")
		return JSON.parse(sessionStorage.getItem(key))
}
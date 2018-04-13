import {mutations} from '../../src/store.js'

let dummyTimeline = {
    "Id": "1",
    "Title": "Wing malfunction",
    "CreationTimeStamp": "636561945406512264",
    "IsDeleted": false,
    "TimelineEvents": []
}

let dummyEvent1 = {
    "Title": "New event",
    "EventDateTime": "2018-03-14 12:22",
    "Description": "Test description",
    "IsDeleted": true,
    "Location": "{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}",
    "Id": "1"
}

let dummyEvent2	= {
	 "Title": "Snakes discovered on plane",
    "EventDateTime": "2018-03-06 12:00",
    "Description": "A snake falls from the storage section above the seats, on to an unsuspecting lady. Unfortunately for her, it is a rattlesnake and it bites - A LOT.",
    "IsDeleted": false,
    "Location": "{\"latitude\":55.86742367672171,\"longitude\":-3.9998274902343383}",
    "Id": "2"
}

describe('store mutations', () => {
	let state
	
	/* Set default state for each test. */
	beforeEach(() => {
		state = {
			timelines: [{
	            "Id": "2",
	            "Title": "Aircraft blew up",
	            "CreationTimeStamp": "636564536427205475",
	            "IsDeleted": false,
	            "TimelineEvents": [dummyEvent1, dummyEvent2]
	        }],
			events: [dummyEvent1, dummyEvent2]
		}
	})

	it('sets timelines array to payload', () => {
		mutations.setTimelines(state, [dummyTimeline])
		expect(state.timelines).toContain(dummyTimeline)
		expect(state.timelines).toHaveLength(1)
	})

	it('sets timelines with events', () => {
		mutations.setTimelinesWithEvents(state, [dummyTimeline])
		expect(state.timelines).toContain(dummyTimeline)
		expect(state.timelines).toHaveLength(1)
	})

	it('adds a timeline to the timelines array', () => {
		mutations.addTimeline(state, dummyTimeline)
		expect(state.timelines).toHaveLength(2)
		expect(state.timelines).toContain(dummyTimeline)
		mutations.addTimeline(state, dummyTimeline)
		mutations.addTimeline(state, dummyTimeline)
		expect(state.timelines).toHaveLength(4)

		let i = state.timelines.filter(timeline => timeline.Id == 1)
		expect(i).toHaveLength(3)
	})

	it('deletes a timeline from the timelines array', () => {
		mutations.deleteTimeline(state, 2)
		expect(state.timelines).toHaveLength(0)
		expect(state.timelines).toEqual([])
		state.timelines = [dummyTimeline, dummyTimeline, dummyTimeline]
		expect(state.timelines).toHaveLength(3)
		mutations.deleteTimeline(state, 1)
		expect(state.timelines).toHaveLength(2)
		mutations.deleteTimeline(state,1)
		expect(state.timelines).toHaveLength(1)
	})

	it('changes the title of an existing timeline', () => {
		state.timelines = [dummyTimeline]
		let editedDummyTimeline = Object.assign({}, dummyTimeline) //clone
		editedDummyTimeline.Title = "A new, edited title"
		mutations.changeTimelineTitle(state, editedDummyTimeline)
		expect(dummyTimeline.Id).toEqual(editedDummyTimeline.Id)
		expect(state.timelines).toHaveLength(1)
		expect(state.timelines).toContain(editedDummyTimeline)
		expect(state.timelines[0].Title).toEqual("A new, edited title")
	})

	it('fetches all the events that are NOT deleted', () => {
		expect(state.events).toHaveLength(2) //initially 2
		mutations.getEvents(state, [dummyEvent1, dummyEvent2, dummyEvent1]) // two of these events have isDeleted=true
		expect(state.events).toHaveLength(1) // thus, should only return one event, the one that's not deleted
	})

	it('creates an event and adds it to the events list', () => {
		mutations.createEvent(state, dummyEvent2)
		expect(state.events).toHaveLength(3)
		mutations.createEvent(state,dummyEvent1)
		expect(state.events).toHaveLength(4)
		expect(state.events.filter(event => event.Id == 2)).toHaveLength(2)
	})

	it('links an event to the correct timeline', () => {
		let dummyPayload = {
			event: Object.assign({}, dummyEvent1),
			timelineId: 2
		}

		state.timelines[0].TimelineEvents = []
		expect(state.timelines[0].TimelineEvents).toHaveLength(0)
		mutations.linkEvent(state, dummyPayload)
		expect(state.timelines).toHaveLength(1)
		expect(state.timelines[0].TimelineEvents).toContain(dummyPayload.event)

		/* Try to add same event to same timeline: should fail */
		mutations.linkEvent(state, dummyPayload)
		expect(state.timelines[0].TimelineEvents).toHaveLength(1)

		mutations.linkEvent(state, {event: {'dummy': 'Dummy!'}, timelineId: 2})
		expect(state.timelines[0].TimelineEvents).toHaveLength(2)
	})

	it('deletes an event from the events array, and from associated timelines linked events', () => {
		expect(state.events).toHaveLength(2)
		expect(state.timelines[0].TimelineEvents).toHaveLength(2)
		expect(state.events).toContain(dummyEvent2)
		expect(state.timelines[0].TimelineEvents).toContain(dummyEvent2)
		mutations.deleteEvent(state, dummyEvent2.Id)
		expect(state.events).toHaveLength(1)
		expect(state.timelines[0].TimelineEvents).toHaveLength(1)
		expect(state.events).not.toContain(dummyEvent2)
		expect(state.timelines[0].TimelineEvents).not.toContain(dummyEvent2)

		mutations.deleteEvent(state, dummyEvent1.Id)
		expect(state.events).toHaveLength(0)
		expect(state.timelines[0].TimelineEvents).toHaveLength(0)
		expect(state.events).not.toContain(dummyEvent1)
		expect(state.timelines[0].TimelineEvents).not.toContain(dummyEvent1)
		mutations.deleteEvent(state, dummyEvent1.Id)

	})


	/* EDIT EVENT TITLE TESTS */
	it('edits the title of an event and updates events array', () => {
		expect(state.events[0].Title).toBe("New event")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.events[0])
		cloned.Title = 'Edited title'
		/* The mutated event is passed to this method, so we check if - after calling it - the event title (only) is changed. */
		mutations.editEventTitle(state, cloned)
		expect(state.events[0].Title).toBe('Edited title')

		/* Assert other fields haven't changed */
		expect(state.events[0].Description).toBe('Test description')
		expect(state.events[0].Location).toBe('{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}')
		expect(state.events[0].EventDateTime).toBe('2018-03-14 12:22')
	})
	
	it('edits the title of an event and updates timelines array', () => {
		expect(state.timelines[0].TimelineEvents[0].Title).toBe("New event")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.timelines[0].TimelineEvents[0])
		cloned.Title = 'Edited title'

		/* The mutated event is passed to this method, so we check if - after calling it - the event title (only) is changed. */
		mutations.editEventTitle(state, cloned)
		expect(state.timelines[0].TimelineEvents[0].Title).toBe('Edited title')

		/* Assert other fields haven't changed */
		expect(state.timelines[0].TimelineEvents[0].Description).toBe('Test description')
		expect(state.timelines[0].TimelineEvents[0].Location).toBe('{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}')
		expect(state.timelines[0].TimelineEvents[0].EventDateTime).toBe('2018-03-14 12:22')
	})

	/* EDIT EVENT DATE TESTS */
	it('edits the date of an event and updates the store\'s events array', () => {
		expect(state.events[0].EventDateTime).toBe("2018-03-14 12:22")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.events[0])
		cloned.EventDateTime = '2015-03-14 12:44'
		/* The mutated event is passed to this method, so we check if - after calling it - the event title (only) is changed. */
		mutations.editEventDate(state, cloned)
		expect(state.events[0].EventDateTime).toBe('2015-03-14 12:44')

		/* Assert other fields haven't changed */
		expect(state.events[0].Description).toBe('Test description')
		expect(state.events[0].Location).toBe('{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}')
		expect(state.events[0].Title).toBe('New event')
	})

	it('edits the date of an event and updates timelines array', () => {
		expect(state.timelines[0].TimelineEvents[0].EventDateTime).toBe("2018-03-14 12:22")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.timelines[0].TimelineEvents[0])
		cloned.EventDateTime = '2015-03-14 12:44'
		mutations.editEventDate(state, cloned)
		expect(state.timelines[0].TimelineEvents[0].EventDateTime).toBe('2015-03-14 12:44') 

		/* Assert other fields haven't changed */
		expect(state.timelines[0].TimelineEvents[0].Description).toBe('Test description')
		expect(state.timelines[0].TimelineEvents[0].Location).toBe('{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}')
		expect(state.timelines[0].TimelineEvents[0].Title).toBe('New event')	
	})

	/* EDIT EVENT DESCRIPTION TESTS */
	it('edits the description of an event and updates the store\'s events array', () => {
		expect(state.events[0].Description).toBe("Test description")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.events[0])
		cloned.Description = 'Shiny new description'
		/* The mutated event is passed to this method, so we check if - after calling it - the event title (only) is changed. */
		mutations.editEventDescription(state, cloned)
		expect(state.events[0].Description).toBe('Shiny new description')

		/* Assert other fields haven't changed */
		expect(state.events[0].EventDateTime).toBe('2018-03-14 12:22')
		expect(state.events[0].Location).toBe('{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}')
		expect(state.events[0].Title).toBe('New event')
	})

	it('edits the description of an event and updates the store\'s timelines array', () => {
		expect(state.timelines[0].TimelineEvents[0].Description).toBe("Test description")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.events[0])
		cloned.Description = 'Shiny new description'
		/* The mutated event is passed to this method, so we check if - after calling it - the event title (only) is changed. */
		mutations.editEventDescription(state, cloned)
		expect(state.timelines[0].TimelineEvents[0].Description).toBe('Shiny new description')

		/* Assert other fields haven't changed */
		expect(state.timelines[0].TimelineEvents[0].EventDateTime).toBe('2018-03-14 12:22')
		expect(state.timelines[0].TimelineEvents[0].Location).toBe('{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}')
		expect(state.timelines[0].TimelineEvents[0].Title).toBe('New event')
	})

	it('edits the location of an event and updates the store\'s timelines array', () => {
		expect(state.timelines[0].TimelineEvents[0].Location).toBe("{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}")
		/* clone the above timeline */
		let cloned = Object.assign({}, state.events[0])
		cloned.Location = 'abcdefg'
		/* The mutated event is passed to this method, so we check if - after calling it - the event title (only) is changed. */
		mutations.editEventLocation(state, cloned)
		expect(state.timelines[0].TimelineEvents[0].Location).toBe('abcdefg')

		/* Assert other fields haven't changed */
		expect(state.timelines[0].TimelineEvents[0].EventDateTime).toBe('2018-03-14 12:22')
		expect(state.timelines[0].TimelineEvents[0].Description).toBe('Test description')
		expect(state.timelines[0].TimelineEvents[0].Title).toBe('New event')
	})

});
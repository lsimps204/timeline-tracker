import { getters } from '../../src/store'

let attachment1 = {
    "Title": "Attachment One",
    "Id": 1
}
let attachment2 = {
    "Title": "Attachment Two",
    "Id": 2
}

let dummyEvent1 = {
    "Title": "New event",
    "EventDateTime": "2018-03-14 12:22",
    "Description": "Test description",
    "IsDeleted": false,
    "Location": "{\"latitude\":55.86125865211763,\"longitude\":-4.030039892578088}",
    "Id": "1",
    "LinkedTimelineEventIds": [],
    "Attachments": [attachment1,attachment2]

}

let dummyEvent2	= {
	 "Title": "Snakes discovered on plane",
    "EventDateTime": "2018-03-06 12:00",
    "Description": "A snake falls from the storage section above the seats, on to an unsuspecting lady. Unfortunately for her, it is a rattlesnake and it bites - A LOT.",
    "IsDeleted": false,
    "Location": "{\"latitude\":55.86742367672171,\"longitude\":-3.9998274902343383}",
    "Id": "2",
    "LinkedTimelineEventIds": [dummyEvent1.Id],
    "Attachments": [attachment2]
}

let dummyTimeline1 = {
    "Id": "2",
    "Title": "Aircraft blew up",
    "CreationTimeStamp": "636564536427205475",
    "IsDeleted": false,
    "TimelineEvents": [dummyEvent1]
}

let dummyTimeline2 = {
    "Id": "1",
    "Title": "Wing malfunction",
    "CreationTimeStamp": "636561945406512264",
    "IsDeleted": false,
    "TimelineEvents": [dummyEvent1, dummyEvent2],
}

describe('store getters', () => {
	let state
	
	/* Set default state for each test. */
	beforeEach(() => {
		state = {
			timelines: [dummyTimeline1, dummyTimeline2],
            events: [dummyEvent1, dummyEvent2],
		}
    })
    
    it ("gets all timelines", () => {
        const result = getters.timelines(state)
        expect(result).toEqual([dummyTimeline1, dummyTimeline2])
    })

    it ("gets the correct number of timelines", () => {
        const result = getters.numberOfTimelines(state)
        expect(result).toBe(2)
    })

    it ("gets the correct search results", () => {
        const result = getters.timelineSearchResults(state, getters)("Wing")
        expect(result).toHaveLength(1)
        expect(result).toEqual([dummyTimeline2])
    })

    it ("gets an individual timeline by ID", () => {
        let result = getters.getTimeline(state, getters)(dummyTimeline1.Id)
        expect(result).toEqual(dummyTimeline1)
        result = getters.getTimeline(state, getters)(dummyTimeline2.Id)
        expect(result).toEqual(dummyTimeline2)
    })

    it ("gets an individual event by ID", () => {
        let result = getters.getEvent(state, getters)(dummyEvent1.Id)
        expect(result).toEqual(dummyEvent1)
        result = getters.getEvent(state, getters)(dummyEvent2.Id)
        expect(result).toEqual(dummyEvent2)
    })
    
    it("gets all attachments for a given event", () => {
        let result = getters.getAttachments(state, getters)(dummyEvent1.Id)
        expect(result).toEqual([attachment1, attachment2])
        result = getters.getAttachments(state, getters)(dummyEvent2.Id)
        expect(result).toEqual([attachment2])
    })

    it("gets an attachment from a given ID", () => {
        let result = getters.getAttachment(state, getters)(attachment1.Id)
        expect(result).toEqual(attachment1)
        result = getters.getAttachment(state, getters)(attachment2.Id)
        expect(result).toEqual(attachment2)
        result = getters.getAttachment(state, getters)(3) // Fake attachment
        expect(result).toBeFalsy()
    })
})
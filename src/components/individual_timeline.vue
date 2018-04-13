<template>
<div class="container">

	<div class="d-flex justify-content-between">
		<ul class="nav nav-tabs mb-4" id="navbar">
			<li class="nav-item">
				<a class="nav-link active" data-toggle="tab" href="#timeline">View Timeline</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" id="add-evt-tab" data-toggle="tab" href="#add-event">Add Event</a>
			</li>   
			<li class="nav-item">
				<a class="nav-link" data-toggle="tab" href="#event-tracker">Event Tracker</a>
			</li>
		</ul>
		<!-- breadcrumb -->
		<nav id="crumbs" class="breadcrumb is-right has-arrow-separator" aria-label="breadcrumbs">
			<ul>
				<li><router-link to="/">Timeline Register</router-link></li>
				<li class="is-active"><a href="#" aria-current="page">Timeline</a></li>
			</ul>
		</nav>
	</div>            
	
	<div class="tab-content mt-2">
		<div class="tab-pane fade show active" id="timeline" role="tabpanel">
			<div class="row">
				<div class="col-8 offset-2">
					<div v-if="eventsOrdered.length > 0">
						<div class="mx-2 mb-4 d-flex justify-content-between p-2 pb-3 border-bottom border-success">
							<div class="leftside">
								<h3>Events</h3>
								<small>There are {{ eventsOrdered.length }} events in timeline: <strong class="text-success">{{title}}</strong></small>
								<br/>
								<small>Click <a @click="toAddEvtTab" href="#">here</a> to add a new event</small>
							</div>
							<div class="rightside control has-icons-right">
								<input type="text" class="input" placeholder="Search events..."
									@keyup="searchEvents" v-model="searchText"/>
								    <span class="icon searchicon is-small is-right">
									<i class="fas fa-search"></i>
									</span>
							</div>
						</div>

						<div v-for="event in results" :key="event.Id"
							class="timeline-event-item" :date-is="event.EventDateTime | humanreadable">
							<span @click="deleteEvent(event.Id)" id="del-evt-span">
								<i class="fas fa-times text-danger"></i>
							</span>
							<router-link class="evt-link" :to="{name: 'event-view', params: {id: event.Id}}">
								<h3 class="timeline-event-title">{{event.Title}}</h3>
								<p class="timeline-event-description">{{event.Description | ucfirst }}</p>
							</router-link>
						</div>
					</div>
					<div class="text-center" v-else>
						<h3 class="text-danger mb-3">
							<i class="fas fa-exclamation-triangle"></i> 
							There are no events in this timeline.
						</h3>
						<small>Click <span id="backlink" @click="back">here</span> to return to the timeline register, or click <a @click="toAddEvtTab" href="#">here</a> to add an event to this timeline</small>
				 	</div>
				</div>
			</div>
		</div>

		<div class="tab-pane fade" id="add-event" role="tabpanel">
			<div class="row">
				<div class="col-10 offset-1">
					<add-event-form :id="id"></add-event-form>
				</div>
			</div>
		</div>

		<div class="tab-pane fade" id="event-tracker" role="tabpanel">
			<div class="row">
				<div>
					<event-tracker :id="id"></event-tracker>
				</div>
			</div>		
		</div>
	</div> <!--/tabcontent-->
	<hr/>

  	<flash :message="flash.msg" :type="flash.type" v-if="shouldFlash" @finished="clearFlash"></flash>

</div>
</template>

<script>
import EventForm from './subcomponents/add_event_form.vue';
import Event from '../models/Event.js'
var moment = require('moment')

export default {
	name: 'individual-timeline',

	components: { 'add-event-form': EventForm },

	data() {
		return {
			id: this.$route.params.id.trim(),
			submitted: false,
			flash: {
				msg: '',
				type: ''
			},
			searchText: ''
		}
	},

	computed: {

		timeline() {
			return this.$store.getters.getTimeline(this.id)
		},

		title() {
			return this.timeline.Title
		},

		eventsOrdered() {
			let events = this.timeline.TimelineEvents.filter(event => !event.IsDeleted)
			if (events.length > 1)
				return this.sortChronologically(events)
			return events
		},

		shouldFlash() { return this.submitted },


		results() {
			if (this.searchText.length > 0) return this.searchEvents()
			else return this.eventsOrdered
		}

	},

	created() {
		this.$store.dispatch('getAllTimelinesWithEvents')
	},

	filters: {
		humanreadable(date) { return moment(date).format("MMM D YYYY, HH:mm:ss") },
		ucfirst(text) { return text[0].toUpperCase() + text.slice(1) }
	},

	methods: {
	    sortChronologically(events) {     
	      return events.sort((a,b) => {
	        if (a.EventDateTime < b.EventDateTime) return -1;
	        if (a.EventDateTime > b.EventDateTime) return 1;
	        return 0;
	      });
		},
		
		deleteEvent(eventId) {
			this.$dialog.confirm("Are you sure you want to delete event: \n'" + 
				this.eventsOrdered.filter(e => e.Id == eventId)[0].Title + "'")
			.then(() =>{
				this.$store.dispatch('deleteEvent', {id:eventId})
				.then(response => this.setFlash("Event was deleted", "success"))
				.catch(err => this.setFlash("Error: could not delete event", "warning"))	
			})
		},

		back() {
			this.$router.go(-1)
		},

		toAddEvtTab() {
			$("#add-evt-tab").tab('show')
		},
		searchEvents() {
			return this.eventsOrdered.filter(event => 
				event.Title.search(new RegExp(this.searchText, "gi")) >= 0
			)
		},

		setFlash(message,type) {
		this.submitted = true
		this.flash.msg = message
		this.flash.type = type
		},

		clearFlash() {
			this.submitted = false
			this.flash.msg = '',
			this.flash.type = ''
		}
	},
}
</script>

<style>
h3 {
	font-weight: bold;
	font-size: 18px;
}

.timeline-event-item {
	margin-left: 5px;
	line-height: 1.5;
	padding: 2.25em 3em 1.5em;
	position: relative;
	color: rgba(black, .7);
	border-left: 4px solid blue;
	border-bottom: 1px dotted blue;
	overflow-wrap: break-word;
}

.timeline-event-title {
	font-size: 1.5rem;
	font-family: 'Oswald', sans-serif;
	text-transform: capitalize;
	color: black;
}

.timeline-event-description {
	font-family: 'Roboto', sans-serif;
	font-size: .9rem;
	padding: 5px;
	color: blue;
}

.timeline-event-item::before {
	content: attr(date-is);
	position: absolute;
	left: 2.4em;
	font-weight: bold;
	font-style: italic;
	top: 1em;
	display: block;
	font-family: 'Roboto', sans-serif;
	font-weight: 700;
	font-size: .785rem;
}

.timeline-event-item::after {
	width: 12px;
	height: 12px;
	display: block;
	top: 1em;
	position: absolute;
	left: -8px;
	border-radius: 10px;
	content: '';
	border: 2px solid blue;
	background: white;
}

.timeline-event-item:last-child {
	border-image: linear-gradient(
		to bottom,
		blue 60%,
		white) 1 100%;
}

.evt-link::hover {
	color:blue;
	text-decoration: underline;
}

#del-evt-span {
	position: absolute;
	right: 15px;
	top: 15px;
	cursor: pointer;
}


#timeline-title-header {
	color: green;
}

#crumbs {
	text-align: center;
	height: 40px;
	background: #eeeeef
}
crumbs h1 {
  padding:0 0 30px; 
  text-transform:uppercase;
  font-size:.9rem;
  font-weight:600;
  letter-spacing:.01rem;
  color: #8093A7;
  height: 40px;
}

#backlink {
	color: blue;
}

#backlink:hover {
	text-decoration: underline;
	color: red;
	cursor: pointer;
}
</style>
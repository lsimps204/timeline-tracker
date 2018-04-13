<template>
	<div class="card">
		<div class="card-header bg-primary">
			<h1>Add Event</h1>
		</div>
<form>
	<div class="card-body">

	<div class="row">
		<div class="col-12 col-md-6">

	<!-- Event title -->
	<div class="form-group">
		<label for="event-title" class="form-control-label">Event Title</label>
		<input v-validate="'required|min:4|max:50'" type="text" id="event-title" data-vv-delay="1000"
			  class="form-control form-control-sm" :class="{'input': true, 'is-danger': errors.has('title') }" 
			  v-model="title" name="title">
		<span v-show="errors.has('title')" class="help is-danger">{{ errors.first('title') }}</span>
	</div>

	<!-- Event description -->
	<div class="form-group">
		<label for="event-description" class="form-control-label">Description</label>
		<textarea v-validate="'required|min:6|max:200'" data-vv-delay="1000" name="description" id="event-description" 
			:class="{'textarea': true, 'is-danger': errors.has('description') }" class="form-control" 
			v-model="description" required>
		</textarea>
		<span v-show="errors.has('description')" class="help is-danger">{{ errors.first('description') }}</span>
	</div>

	<!-- Event date -->
	<div class="form-inline form-group">
		<flat-pickr v-validate="'required|date_format:YYYY-MM-DD HH:mm'" v-model="datetime" 
			class="form-control col-8 mr-1" :config="dateConfig" id="event-datetime" name="datetime"
			:class="{'is-danger': errors.has('datetime') }" placeholder="Select a date/time">
		</flat-pickr>
    	<button type="button" class="btn-danger" @click="clearDate" id="clearDate">Clear</button>
    	<span v-show="errors.has('datetime')" class="help is-danger">{{ errors.first('datetime') }}</span>
	</div>

	<!-- Link events -->
	<div class="mb-4">
		<label>Link events</label><br/>
		<div class="select is-multiple">
		<select v-model="selected" multiple>
			<option v-for="event in allEvents"
				:key="event.Id" :value="event.Id">{{ event.Title }} </option>
		</select>
		</div>
	</div>

	</div> <!--/col6-->
	<div class="col-12 col-md-6">
		
	<div class="mb-4">
		<label for="map" class="form-control-label">Location</label>
		<input id="location-text" name="location" type="text" class="form-control mb-2" v-model="locationText" readonly="true" v-validate="'required'" :class="{'is-danger': errors.has('location') }" />
		<div id="map"></div>
		<span v-show="errors.has('location')" class="help is-danger">{{ errors.first('location') }}</span>
	</div>

	Add Attachment(s): <span @click="addAttachment=!addAttachment"><i class="fas fa-plus primary"></i></span>
	<add-attachment v-show="addAttachment" @close="addAttachment=!addAttachment"
		@getFiles="getFiles" @clear="clearFiles"></add-attachment>

	<div class="mt-2">
		<ul>
			<li v-for="f in attachmentsArray">{{ f[0] }} - {{f[1].name}}</li>
		</ul>
	</div>
	
	</div><!--/col6-->
</div><!--/row -->
	<button type="button" 
			class="btn btn-primary" 
			@click="addEvent" 
			:disabled="disableBtn">Add Event</button>
</div><!--/cardbody-->

</form>

  <flash :message="flash.msg" :type="flash.type" v-if="shouldFlash" @finished="clearFlash"></flash>
  <spinner id="spinner" size="big" message="Loading..." v-show="spin"></spinner>
</div>
</template>

<script>

/* FlatPickr is the date-time component for the event's date and time field */
 import flatPickr from 'vue-flatpickr-component';
 import 'flatpickr/dist/flatpickr.css';
 import Attachment from '../../models/Attachment.js'

export default {
	name: 'event-form',
	props: ['id'],

	data() {
		return {
			title: '',
			description: '',
			datetime: '',
			locationText: '',
			location: null,
			dateConfig: {
		       altFormat: "F j, Y H:i",
       			altInput: true,
       			enableTime: true,
       			maxDate: "today",
       			time_24hr: true,
			},

			geoCoordinates: {
				latitude: null,
				longitude: null
			},
			map: null,
			marker: null,
			geocoder: new google.maps.Geocoder,
			addAttachment: false,
			attachments: null,
			attachmentsArray: null,
			formDataMap: new Map(),
			submitted: false,
			flash: {
				msg: '',
				type: ''
			},
			spin: false,
			disableBtn: false,
			selected: []
		}
	},

	components: { flatPickr },

	computed: {
		latitude() { return parseFloat(this.geoCoordinates.latitude) },
		longitude() { return parseFloat(this.geoCoordinates.longitude) },
		shouldFlash() { return this.submitted },
		allEvents() { return this.$store.getters.getTimelineEvents(this.id) }

	},

	methods: {
		/* TEST: when adding event to the timeline, check this occurs. Don't let event be created but not attached */
		addEvent() {
			// CHECK FOR DUPLICATES TOO
			this.allFormFieldsAreValid().then(result => {
				if (result) {
					this.disableBtn = true
					this.spin = true
					this.$store.dispatch('createEvent',{
					  'timelineId': this.id,
			          'title': this.title,
			          'description': this.description,
			          'datetime': this.datetime,
			          'location': JSON.stringify(this.geoCoordinates)
			        }).then(response => {
						this.setFlash("Event successfully created", "success")
						this.parseLinkedEvents(response.Id)
							.then(() => {
								if (this.formDataMap.size) {
									this.dispatchAddAttachments(response.Id)
								} else {
									this.resetData()
									this.redirect(response.Id)
								}
							})
			        }).catch(err => {
						this.setFlash("Failed to create event", "warning")
						this.resetData()
					});
				} else {
					this.setFlash("Invalid form fields", "warning")
				}			
			})
		},

		/* For each linked event, create a payload object and dispatch the 'linkEvents' action */
		parseLinkedEvents(newEventId) {
			if (this.selected.length) {
				return new Promise((resolve,reject) => {
					this.selected.forEach(id => {
						let payload = {
							'timelineId': this.id,
							'childId': newEventId,
							'parentId': id
						}
						this.$store.dispatch("linkEvents", payload)
							.then(() => resolve())
							.catch(() => reject())
					})
				})
			} else {
				return Promise.resolve()
			}
		},

		/* Adds any attachments linked to the event upon creation */
		dispatchAddAttachments(eventId) {
			for (let file of this.formDataMap.entries()) {
				this.$store.dispatch('addAttachment', {
	        		TimelineEventId: eventId,
	        		Title: file[0]
	        	}).then(response => {
	        		let attachmentId = response.Id
	        		Attachment.getUploadLink(attachmentId)
	        			.then(response => {
	        				let url = response.data
	        				Attachment.upload(url, file[1])
	        					.then(response => {
									this.$store.commit('addAttachmentToStorage', {
										'id': attachmentId,
										'title': file[0],
										'data': file[1]
									})
	        						console.log("attachment upload successful")
	        						this.setFlash("Attachment uploaded successfully", "success")
									this.resetData()
									this.redirect(eventId)
	        					})
	        					.catch(err => {
	        						this.setFlash("Attachment upload failed", "warning")
									this.resetData()
									this.redirect(eventId)
	        					})
	        			})
	        	}).catch(err => {
	        		this.setFlash("Attachment upload failed", "warning")
					this.resetData()
	        	})
			}
		},

		redirect(eventId) {
			this.$router.push({name: 'event-view', params: {id: eventId}})
		},

	    allFormFieldsAreValid() {
	      	return new Promise((resolve, reject) => {
	      		this.$validator.validateAll({
		      		title: this.title,
		      		description: this.description,
		      		datetime: this.datetime,
		      		location: this.locationText})
		      	.then((result) => {
		      		resolve(result)
			    }).catch(err => reject(err))
			})
	    },

		resetData() {
			this.clearForm()
	        this.spin=false
			this.disableBtn = false
		},

	    getFiles(payload) {
	    	this.attachments = payload.attachment
	    	this.attachmentsArray = Array.from(this.attachments.entries())
	    	this.formDataMap = payload.formdataMap
	    },

		clearDate() {
			this.datetime = ''
		},

		clearFiles() {
			this.attachments = null
			this.attachmentsArray = null
			this.formDataMap  = new Map()
		},

		/* Convert a (latitude, longitude) coordinate into an English place-name */
		reverseGeocoding() {
			const loc = {
				lat: this.latitude,
				lng: this.longitude
			}
			this.geocoder.geocode({'location': loc}, (results, status) => {
				if (status === 'OK') {
					if (results[0]) {
				        this.locationText = results[0].formatted_address
				        this.map.setCenter(this.marker.getPosition());
					} else {
						//check this
						this.locationText = this.latitude + " " + this.longitude
					}
				} else {
					this.locationText = this.latitude + " " + this.longitude
				}
			})
		},

		clearForm() {
			this.title = ''
			this.description = ''
			this.datetime = ''
			this.locationText = ''
			this.clearFiles()
		},

	    setFlash(message,type) {
	      this.submitted = true
	      this.flash.msg = message
	      this.flash.type = type
	    },

	    clearFlash() {
	      this.submitted = false
	      this.flash.msg = ''
	      this.flash.type = ''
	    },
	},

	mounted() {
		const element = document.getElementById('map')
		const glasgow = {lat: 55.8628, lng: -4.2429}
		const options = {
			zoom: 10,
			center: glasgow,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoomControl: true,
		}
		this.geoCoordinates.latitude = glasgow.lat
		this.geoCoordinates.longitude = glasgow.lng

		/* Set the map up */
		this.map = new google.maps.Map(element, options)

		/* Set initial marker */
		this.marker = new google.maps.Marker({
		  position: glasgow,
		  map: this.map,
		  draggable: true,
		  animation: google.maps.Animation.DROP
		})

		/* Set event listener */
		google.maps.event.addListener(this.marker, 'dragend', event => {
			this.geoCoordinates.latitude = event.latLng.lat()
			this.geoCoordinates.longitude = event.latLng.lng()
			this.reverseGeocoding()
		})
	},
}

</script>


<style>

#clearDate {
	border-radius: 6px 6px 6px 6px;
	transition: transform 10s;
	transform-origin:left; 
	transform:scaleX(1);
}

#clearDate:hover {
	transform:scaleX(1.0);
}

#map {
	height: 250px;
	width: 400px;
	background-color: red;
}

.errorAlert-enter-active {
  transition: all .4s ease;
}

.errorAlert-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.errorAlert-enter, .errorAlert-leave-to {
    transform: translateX(10px);
    opacity: 0;
}

.card-header > h1 {
	color: #eeeeee;
}

.fa-plus {
	color: blue;
}
</style>
<template>
  <section class="event container">

    <div class="row">
      <div class="col-10 offset-1">

        <div class="d-flex justify-content-between">
          <h3 id="evt-title"> {{ title | titleCut }}</h3>
        <nav id="eventcrumbs" class="breadcrumb is-right has-arrow-separator" aria-label="breadcrumbs">
          <ul>
            <li><router-link to="/">Timeline Register</router-link></li>
            <li><router-link :to="{name: 'timeline-view', params:{id: parentTimeline.Id}}">Timeline</router-link></li>
            <li class="is-active"><a href="#" aria-current="page">Event</a></li>
          </ul>
        </nav>
        </div>


        <div class="card">
        <div class="card-body px-4">
          <ul class="nav nav-tabs mb-4" id="navbar">
              <li class="nav-item">
                  <a class="nav-link active" id="event-info" data-toggle="tab" href="#event_info">Event Info</a>
              </li>
              <li class="nav-item">
                  <a class="nav-link" data-toggle="tab" href="#linked_events">Linked Events</a>
              </li>
              <li class="nav-item">
                  <a class="nav-link" data-toggle="tab" href="#event_attachments">Attachments</a>
              </li>             
          </ul>
 
          <!-- Event info tab -->
          <div class="tab-content">
            <div class="tab-pane active" id="event_info" role="tabpanel">

           <!-- Event Location -->
          <div class="mt-2 col-12 col-md-6 float-right" id="eventLocation">
              <div id="map" class="mb-2 col-12"></div>
              <strong>{{ locationText }}</strong>
              <div class="edited-loc-details" v-if="locationChanged && reverseLookupComplete">
                <p id="edited-evt-location" class="my-2">
                  <span class="text-primary mr-1">
                  <i class="fas fa-map-marker-alt"></i>
                  </span> {{ editedLocationText }}</p>
                
                <div class="confirm-buttons mt-2">
                  <a class="button is-small is-success" @click="saveNewLocation">
                    <span class="icon is-small">
                      <i class="fas fa-check"></i>
                    </span>
                    <span>Save New Location</span>
                  </a>                      
                  <a class="ml-1 button is-small" @click="cancelEditLocation">
                    <span class="icon is-small">
                      <i class="fas fa-undo"></i>
                    </span>
                    <span>Reset</span>
                  </a>
                </div> <!--/btns -->                
              </div> <!--/edited -->
          </div>

            
        <!-- Event Title -->
          <div class="col-12 col-md-6">
            <h1 v-if="!showEditTitle" id="event-view-title" class="mb-1">{{ title }}</h1>
            <span v-if="showEditTitle">
              <input type="text" class="form-control mb-2" id="newTitleField" 
                    placeholder="Enter a new title" v-model="editedTitle"
                    :autofocus="showEditTitle"/>
              <button type="button" id="submitNewTitleBtn" class="btn btn-success btn-sm"
                @click="saveNewTitle">Save Title</button>
              <button type="button" class="btn btn-sm"
                @click="cancelEditTitle">Cancel</button>
            </span>

            <span @click="editEventTitle" v-if="!showEditTitle">
              <i class="far fa-edit fa-sm ml-2" 
                data-toggle="tooltip" 
                title="Edit title"></i>
              </span>
          </div>

          <!-- Event Date -->
          <div class="mb-3 col-12 col-md-6">
            <p v-if="!showEditDate" class="mb-3" id="event-date-title">
                {{ datetime | humanreadable }}
            </p>

            <span v-if="showEditDate">
            <flat-pickr v-validate="'required|date_format:YYYY-MM-DD HH:mm'" v-model="editedDateTime" 
              class="mr-1 my-2" :config="dateConfig" id="event-datetime" name="editedDatetime"
              :class="{'is-danger': errors.has('editedDatetime') }" placeholder="Select new date/time...">
            </flat-pickr>

              <button type="button" id="submitNewDateBtn" class="btn btn-success btn-sm"
                @click="saveNewDate">Save Date</button>
              <button type="button" class="btn btn-sm"
                @click="cancelEditDate">Cancel</button>
            </span>
            <span @click="editEventDate" v-if="!showEditDate">
              <i class="far fa-edit fa-sm ml-2" 
                data-toggle="tooltip" 
                title="Edit Date"></i>
            </span>
           </div>

          <!-- Event Description -->
          <div class="border-bottom col-12 col-md-6">
            <div class="mb-3">
              <p v-if="!showEditDescription" id="event-date-description">
                {{ description }}
              </p>
              <span v-if="showEditDescription">
                <textarea class="form-control mb-2" v-model="editedDescription" 
                  placeholder="Enter new description..." :autofocus="showEditDescription"></textarea>
                <button type="button" id="submitNewDescriptionBtn" class="btn btn-success btn-sm"
                  @click="saveNewDescription">Save Description</button>
                <button type="button" class="btn btn-sm"
                  @click="cancelEditDescription">Cancel</button>
              </span>
              <span @click="editEventDescription" v-if="!showEditDescription">
                <i class="far fa-edit fa-sm ml-2" 
                  data-toggle="tooltip" 
                  title="Edit Description"></i>
              </span>
            </div>
          </div>

        <div class="button-container">
          <button class="btn btn-danger btn-sm mt-4" @click="rmEvent">Delete this event</button>
          <button class="btn btn-primary btn-sm mt-4" @click="back">Back to timeline</button>
        </div>
        </div>
        
        <!-- Linked events tab panel -->
         <div class="tab-pane" id="linked_events" role="tabpanel">
           <div v-if="linkedEvents.length > 0" class="d-flex justify-content-around">
              <ul class="list-group">
                <li class="list-group-item" 
                    v-for="linked in linkedEvents" 
                    :key="linked.Id">
                  <router-link :to="{name: 'event-view', params: {id: linked.Id}}">
                    {{ linked.Title }}
                  </router-link>
                </li>
              </ul>
           </div>
           <div v-else>
             This event is not linked to any events
          </div>
          </div>

        <!-- Attachments tab panel -->
         <div class="tab-pane ml-4" id="event_attachments" role="tabpanel">
            <div v-if="attachments.length>0">
              <h2 class="mb-4">This event has {{attachments.length}} attachment(s). Click the icon to view.</h2>
              <ul class="mt-2">
                <div v-for="(attachment, index) in attachments" :key="attachment.Id">
                  <attachment-component :data="attachment" :index="index" 
                    class="mb-4" @deleted="attachmentDeleted"></attachment-component>
                </div>
              </ul>
            </div>
            <div v-else>
              <strong>This event has no attachments</strong>
            </div>
          </div>
        </div><!--/tab-content -->

        </div> <!--/card-body -->
  </div> <!--/card -->
  </div> <!--/col -->
  </div> <!--/row -->
  <div class="col-10 offset-1">
    <hr/>
  </div>
  <flash :message="flash.msg" :type="flash.type" 
    v-if="shouldFlash" @finished="clearFlash"></flash>

  </section>
</template>

<script>
import Attachment from '../models/Attachment.js'
import AttachmentComponent from './attachment.vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
var moment = require('moment')

export default {
  name: 'event',

  components: { flatPickr, AttachmentComponent },

  data () {
    return {
      id: this.$route.params.id.trim(),
      geoCoordinates: {
        latitude: null,
        longitude: null
      },
      editedGeoCoordinates: {
        latitude: null,
        longitude: null
      },
      map: null,
      marker: null,
      geocoder: new google.maps.Geocoder,
      locationText: null,
      showEditTitle: false,
      showEditDate: false,
      showEditDescription: false,  
  		dateConfig: {
		    altFormat: "F j, Y H:i",
        altInput: true,
        enableTime: true,
        maxDate: "today",
        time_24hr: true,
			},
      editedDateTime: '',
      editedTitle: '',
      editedDescription: '',
      editedLocationText: '',
      submitted: false,
      flash: {
        msg:'', type: ''
      },
      reverseLookupComplete: false,
    }
  },

  computed: {
    event() { return this.$store.getters.getEventFromTimeline(this.id) },
    attachments() { return this.$store.getters.getAttachments(this.id); },
    title() { return this.event.Title },
    location() { return JSON.parse(this.event.Location)},
    description() { return this.event.Description },
    datetime() { return this.event.EventDateTime },
    shouldFlash() { return this.submitted },
    locationChanged() { return this.editedGeoCoordinates.latitude != null && this.editedGeoCoordinates.longitude != null },
    linkedEvents() {
       let linkedEvents = []
       console.log(this.event.LinkedTimelineEventIds)
       this.event.LinkedTimelineEventIds.forEach(eventId => {
         let e = this.$store.getters.getEventFromTimeline(eventId)
         if (e) linkedEvents.push(e)
       })
       return linkedEvents
    },
    parentTimeline() { return this.$store.getters.getParentTimeline(this.id) }
  },

  methods: {
    back() {
      this.$router.push({name: 'timeline-view', params: {id: this.parentTimeline.Id }})
    },

    editEventTitle() { this.showEditTitle = true },

    editEventDate() { this.showEditDate = true },

    editEventDescription() { this.showEditDescription = true },

    /* Methods for editing event fields */
    saveNewTitle() {
      if (this.editedTitle.length > 3) {
        this.disableBtn("submitNewTitleBtn")
        this.$store.dispatch('editEventTitle', {id: this.id, newTitle: this.editedTitle})
          .then(response => {
            this.setFlash("New title added", "success")
            this.cancelEditTitle()
          }).catch(err => this.setFlash("Title change failed", "warning"))
      } else {
        this.setFlash("Title must be 4 characters or more", "warning")
      }
    },

    saveNewDate() {
      this.dateIsValid()
      .then(response => {
         this.disableBtn("submitNewDateBtn")
          this.$store.dispatch('editEventDate', {id: this.id, datetime: this.editedDateTime})
            .then(response => {
              this.setFlash("New date set for this event", "success")
              this.cancelEditDate()
             }).catch(err => this.setFlash("Date change failed", "warning"))
      }).catch(err => this.setFlash("Date format is invalid", "warning"))
    },

    saveNewDescription() {
      if (this.editedDescription.length > 5) {
        this.disableBtn("submitNewDescriptionBtn")
        this.$store.dispatch('editEventDescription', {id: this.id, description: this.editedDescription})
          .then(response => {
            console.log("changed")
            this.setFlash("New description added", "success")
            this.cancelEditDescription()
          }).catch(err => this.setFlash("Description change failed", "warning"))
      } else {
        this.setFlash("Description must be 6 characters or more", "warning")
      }
    },

    saveNewLocation() {
      if(this.editedLocationIsValid()) {
        const newLocation = JSON.stringify(this.editedGeoCoordinates)
        this.$store.dispatch("editEventLocation", { id:this.id, location: newLocation })
          .then(response => {
            this.setFlash("New location added", "success")
            this.locationText = this.editedLocationText
            this.geoCoordinates = this.editedGeoCoordinates
            this.cancelEditLocation()
          }).catch(err => this.setFlash("Location change failed", "warning"))
      } else {
        this.setFlash("Invalid location specified", "warning") // Shouldn't ever be reached...
      }
    },

    dateIsValid() {
      return new Promise((resolve,reject) => {
        this.$validator.validateAll({editedDatetime: this.editedDateTime})
          .then(response => {
            if (response) resolve(response)
            else reject()
          }).catch(err => reject(err))
      })
    },

    editedLocationIsValid() {
      let editedValues = Object.values(this.editedGeoCoordinates)
      return editedValues.every(val => val != null)
    },

    cancelEditTitle() {
      this.showEditTitle = false
      this.editedTitle = ''
    },
    cancelEditDate() {
      this.showEditDate = false
      this.editedDateTime = ''
    },

    cancelEditDescription() {
      this.showEditDescription = false
      this.editedDescription = ''
    },

    /* Reset the map's marker to the initial location, and centre the map there. Remove edited field data */
    cancelEditLocation() {
      this.editedLocationText = ''
      this.reverseLookupComplete = false
      this.marker.setPosition({lat: this.location.latitude, lng: this.location.longitude})
      this.map.setCenter(this.marker.getPosition())
      Object.keys(this.editedGeoCoordinates).map(key => this.editedGeoCoordinates[key] = null)
    },

    rmEvent() {
      this.$dialog.confirm("Are you sure you wish to delete event: \n'" + this.title + "'")
        .then(() => {
          this.$router.go(-1)
          this.$store.dispatch('deleteEvent', {id:this.id})
            .catch(err => {
              console.log(err)
            })
        })
    },

    attachmentDeleted() {
      this.setFlash("Attachment was deleted","success")
    },
    
    reverseGeocoding(edit) {
      let loc;

      /* On mount, set to the event location pulled from the API (the 'if' condition)
       * On edit, set to the user-edited coordinates ('else' condition)
       */
      if (typeof edit === 'undefined') {
        loc = {
          lat: this.location.latitude,
          lng: this.location.longitude
        }
      } else {
        loc = {
          lat: this.editedGeoCoordinates.latitude,
          lng: this.editedGeoCoordinates.longitude
        }
      }

      /* Perform the reverse geocoding operation to get the location's textual representation */
      this.geocoder.geocode({'location': loc}, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
              if (edit) this.editedLocationText = results[0].formatted_address
              else this.locationText = results[0].formatted_address
          } else {
            //check this
            if (edit) this.editedLocationText = this.latitude + " " + this.longitude
            else this.locationText = this.latitude + " " + this.longitude
          }
        } else {
            if (edit) this.editedLocationText = this.latitude + " " + this.longitude
            else this.locationText = this.latitude + " " + this.longitude
          }
        this.map.setCenter(this.marker.getPosition());
        if(edit) this.reverseLookupComplete = true
      })
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

    disableBtn(id) {
      $("#" + id).prop('disabled', true)
      $("#" + id).text("Loading...")
    },

      initMap() {
      const element = document.getElementById('map')
      const location = {lat: this.location.latitude, lng: this.location.longitude}
      const options = {
        zoom: 10,
        center: location,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
      }
      this.geoCoordinates.latitude = location.lat
      this.geoCoordinates.longitude = location.lng

      /* Set the map up */
      this.map = new google.maps.Map(element, options)

      /* Set initial marker */
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        draggable: true,
        animation: google.maps.Animation.DROP
      })

      /* Set event listener */
      google.maps.event.addListener(this.marker, 'dragend', event => {
        this.editedGeoCoordinates.latitude = event.latLng.lat()
        this.editedGeoCoordinates.longitude = event.latLng.lng()
        this.reverseGeocoding("edit") /* Pass an arg to tell the method that it's dealing w/ an edited location value */
      })

      this.reverseGeocoding()
      }

    },

    mounted() {
      this.initMap()
    },

    beforeDestroy() {
      this.$emit("deleted")
    },

    filters: {
      humanreadable(date) { return moment(date).format("MMMM Do YYYY, HH:mm:ss") },
      titleCut(text) { 
        return text.length > 28 
          ? text.slice(0,25) + '...' 
          : text 
        }
    },

    beforeRouteUpdate(to,from,next) {
      this.id = to.params.id.trim()
      this.initMap()
      $("#event-info").tab('show')
      next()
    }
}

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#map {
  height: 250px;
  width: 400px;
  border-radius: 0.5rem;
}

#event-view-title {
  display: inline;
  font-size: 26px;
  text-transform: capitalize;
}

h2 > strong {
  color: #eeeeee;
  text-transform: uppercase;
}

#event-date-title {
  display: inline;
  color: #aaa;
  font-size: 14px;
}

#event-date-description {
  display: inline;
  margin-right: 10px;
}

#event-datetime {
  width: 100px;
}

#newTitleField {
  background-color: #fff;
  border: 1px solid blue;
  border-radius: 2px;
}

.fa-image {
  color: green;
}

#eventcrumbs {
  max-height: 40px;
}

#evt-title {
  font-size: 28px;
  font-weight:700;
  color: green;
  overflow-wrap: break-word;
}

#edited-evt-location > i {
  color: blue;
}

.confirm-buttons {
  color: black;
}
.confirm-buttons > a:last-child {
  background: #fe3545;
}
</style>

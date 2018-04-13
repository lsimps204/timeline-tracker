<template>
  <tr>
    <td class="timeline-title">
      <router-link class="nav-link" :to="{ name: 'timeline-view', params: { id: id }}">
        {{ title | filterTitleLength }}
      </router-link>
    </td>
    <td>{{ creationTimeStamp | normalizeDate }}</td>
    <td>
      <span @click="showModal">
        <i class="far fa-edit fa-lg"></i>
      </span>
    <td>
      <span @click="deleteTimeline">
        <i class="fas fa-times text-danger"></i>
      </span>
    </td>

<!-- Edit title Bulma modal -->
<div class="modal" :class="{'is-active': editingTitle }">
  <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Title</p>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>
      <section class="modal-card-body float-left">        
        <div class="form-group">
          <p class="mb-3">Please select a new title for the timeline: 
            <br/><strong>'{{ title }}'</strong>
          </p>
          <label for="new-timeline-title" class="form-control-label">New Title</label>
          <input type="text" class="form-control" 
              name="new-title" id="new-timeline-title" 
              v-model="editedTitle" v-validate="'min:4'" @keyup.enter="editTitle"/>
          <span v-show="errors.has('new-title')" class="help is-danger">
            {{ errors.first('new-title') }}
          </span>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click.prevent="editTitle">Save changes</button>
        <button class="button" @click="close">Cancel</button>
      </footer>
    </div>
  </div>
</div>

  <flash :message="flash.msg" :type="flash.type" v-if="showFlash" @finished="clearFlash"></flash>
</tr> 
</template>

<script>

import axios from '../axios.js'
import Timeline from '../models/Timeline';

var moment = require('moment')

export default {
  name: 'timeline',

  props: ['id'],
  
  data () {
    return {
      events: [],
      editingTitle: false,
      editedTitle: '',
      submitted: false,
      flash: {
        msg: '',
        type: ''
      }
    }
  },

  computed: {    
    /* Returns the number of events in this particular timeline */
    numberOfEvents() {
      return this.events.length;
    },

    title() {
      return this.$store.getters.getTimeline(this.id).Title
    },

    creationTimeStamp() {
      return this.$store.getters.getTimeline(this.id).CreationTimeStamp
    },

    showFlash() {
      return this.submitted
    }
  },

  mounted() {
    let timeline = this.$store.getters.getTimeline(this.id)
  },

  beforeDestroy() {
    this.$emit("deleted", this.id)
  },

  methods: {
    deleteTimeline() {
      this.$dialog.confirm('Are you sure you wish to delete the timeline: \n\"' + this.title + '\"')
        .then(() => {
          this.$store.dispatch('deleteTimeline', {id: this.id})
            .then(response => console.log(""))
            .catch(err => this.setFlash("Timeline deletion failed", "warning"))
        })
    },

    editTitle() {
      if (this.editedTitle.length >= 4) {
        this.$store.dispatch('editTitle',{
          'id': this.id,
          'title': this.editedTitle
        }).then(response => {
          this.setFlash("Title was edited!", "success")
          this.editingTitle = false
        })
        .catch(err => this.setFlash("Edit failed", "warning"))
      }
      this.editedTitle = ''
    },

    getEvents() {
      Timeline.getEvents({'TimelineId': this.id})
        .then(response => this.events = response.data)
        .catch(err => console.log(err))
    },

    showModal() {
      this.editingTitle = true;
    },

    close(action) {
      this.editingTitle = false
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
    },

  },

  filters: {
    filterTitleLength(text) {
      return text.length < 43 ? text : text.substring(0,40) + "..."
    },

    normalizeDate(date) {
      var norm_date = date / 10000
      var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));
      var tickDate = new Date(norm_date - epochMicrotimeDiff);
      return moment(tickDate).format("MMMM Do YYYY, HH:mm:ss")
    }
  },

}
</script>

<style>

.nav-link:hover {
  color: darkblue;
  text-decoration: underline;
  cursor: pointer;
}

td > span {
  cursor: pointer;
}
</style>

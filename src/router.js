import VueRouter from 'vue-router'
import TimelineRegister from './components/timeline_register.vue';
import TimelineView from './components/individual_timeline.vue';
import Event from './components/event.vue'
import AttachmentImage from './components/image.vue'

let routes = [
	{
      path: '/',
      name: 'timeline-register',
      component: TimelineRegister
	},
	{
		path: '/timeline/:id',
		name: 'timeline-view',
		component: TimelineView
	},
	{
		path: '/event/:id',
		name: 'event-view',
		component: Event
	},
	{
		path: '/image-viewer/:id',
		name: 'image-view',
		component: AttachmentImage,
		params: true
	}
]

export const router = new VueRouter({
	mode: 'history',
	base: __dirname,
  	routes
})
import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

/* data store */
import {store} from './store'

/* router */
import {router} from './router'

/* validation */
import VeeValidate from 'vee-validate'

/* Loading spinner */
import Spinner from 'vue-simple-spinner'

/* Dialogue boxes */
import VuejsDialog from "vuejs-dialog"

Vue.use(VeeValidate);
Vue.use(VueRouter)
Vue.use(VuejsDialog)

import AddAttachment from './components/subcomponents/add_attachment.vue'
import Flash from './components/flash.vue'
import EventTracker from './components/event-tracker.vue'

Vue.component("add-attachment", AddAttachment)
Vue.component('flash', Flash)
Vue.component('spinner', Spinner)
Vue.component("event-tracker", EventTracker)

new Vue({
  el: '#app',
  store: store,
  router: router,
  render: h => h(App)
})


if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('../dist/service-worker.js').then(reg => {
		reg.onupdatefound = function() {
			console.log("changed")
		}
	});
}
// /* Service worker stuff */
// if ('serviceWorker' in navigator) {
// 	navigator.serviceWorker.register('/src/sw.js', {scope: '/src/'})
//   		.then(function(reg) {

//         if(reg.installing) {
//           console.log('Service worker installing');
//         } else if(reg.waiting) {
//           console.log('Service worker installed');
//         } else if(reg.active) {
//           console.log('Service worker active');
//         }

//       }).catch(function(error) {
//         // registration failed
//         console.log('Registration failed with ' + error);
//       });
// }
import {shallow, createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import TimelineRegister from '../../src/components/timeline_register.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

import {getters} from '../../src/store.js'

/* Mock store */
const store = new Vuex.Store({
	state: {timelines: [], events: []},
	getters,
})

describe('Test suite for timeline-register', () => {
	let wrapper

	beforeEach(() => 
		wrapper = shallow(TimelineRegister, { store })
	)

	it('correctly sets component\'s initial values', () => {
		expect(wrapper.vm.title).toEqual('')
		expect(wrapper.vm.searchInput).toEqual('')
		expect(wrapper.vm.numberOfResults).toEqual('')
		expect(wrapper.vm.searching).toBeFalsy()
		expect(wrapper.vm.adding).toBeFalsy()
		expect(wrapper.vm.sortingTitle).toBeFalsy()
		expect(wrapper.vm.sortingDate).toBeFalsy()
		expect(wrapper.vm.timelineTitleSortedDesc).toBeFalsy()
		expect(wrapper.vm.timelineDateSortedDesc).toBeFalsy()
	})
})
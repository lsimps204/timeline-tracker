<template>
<section class="timeline-register">

    <!-- Timeline register -->
    <div class="register container"> 


        <div class="row">
          <div class="col-8 offset-2">

        <div class="card">
          <div class="card-header">
            <h2 class="card-title lead">
              <strong>Timelines</strong>
            </h2>

            <div class="ml-auto px-2">
              <span class="register-icons" data-toggle="tooltip" title="Search" @click="adding=false; searching=!searching">
                <i class="fas fa-search fa-lg" id="search-icon"></i>
              </span>
            <span class="register-icons" data-toggle="tooltip" title="Add Timeline" 
                @click="searching=false; adding=!adding">
              <i class="fas fa-plus"></i>
            </span>
            </div>
          </div>

        <transition name="searchTransition">
          <div class="card-body" v-if="searching">
            <button class="float-right btn btn-sm btn-danger" @click="searching=!searching; searchInput='';">X</button>
            <h1 class="mb-2">Search timelines</h1>
            <input type="text" class="form-control-inline col-8" v-model="searchInput" @keyup="search" placeholder="Enter search query..."/>
            <span class="counter" v-if="searchInput!=''">{{ numberOfSearchResults }} results</span>
          </div>
        </transition>

        <transition name="addTransition">
          <div class="card-body" v-if="adding">
            <button class="float-right btn btn-sm btn-danger" @click="adding=!adding; title='';">X</button>
            <h1 class="mb-2">Add timeline</h1>
            <input type="text" name="add-timeline" class="form-control-inline col-8" 
              v-model="title" @keyup.enter="addTimeline" v-validate="'required|min:4'" 
              :class="{'is-danger': errors.has('add-timeline') }" placeholder=" Timeline title"/>
            <button id="add_timeline_btn" class="btn btn-primary btn-md ml-2" @click="addTimeline" :disabled="disabled">Submit</button>
            <span v-show="errors.has('add-timeline') && title!=''" class="help is-danger">{{ errors.first('add-timeline') }}</span>
          </div>
        </transition>

      <table class="table table-hover table-bordered mb-1 col-12" 
        v-if="numberOfTimelines>0 && numberOfSearchResults > 0">

        <thead class="thead-inverse">
          <th @click="sortTitle" class="sortableTableHeader" id="table-title">Title 
              <i v-if="sortingTitle" :class="titleSorting"></i></th>
          <th @click="sortDate" class="sortableTableHeader" id="table-date">Created 
            <i v-if="sortingDate" :class="dateSorting"></i></th>
          <th>Edit Title</th>
          <th>Delete</th>
        </thead>

        <tbody>
            <timeline v-for="timeline in paginatedTimelines"
                      :id="timeline.Id"
                      :key="timeline.Id"
                      @deleted="timelineDeleted">
            </timeline>
        </tbody>

    </table>

  
    <div class="d-flex justify-content-between mb-2">
      <span id="paginator" class="ml-3 mt-2">
        <small>Results per-page:</small>
        <select class="custom-select col-6 col-sm-8 col-md-4" 
          v-model="paginationConfig.numberPerPage" @change="changedNumberPerPage">
          <option>2</option>
          <option selected>5</option>
          <option>10</option>
          <option>20</option>
        </select>
      </span>
      <small id="pagination-msg" class="ml-auto mr-2">
        <ul v-if="searchInput==''"><li>
          {{numberOfTimelines}} timelines 
          <span class="text-success">|</span> 
          Page {{paginationConfig.currentPage + 1}} of {{numberOfPages == 0 ? numberOfPages + 1 : numberOfPages}}
        </li></ul>
      </small>
    <!-- Pagination -->
    </div>

    <!-- Pagination Links -->
    <nav v-if="paginate" id="paginate-links" class="ml-auto mb-4 mr-4">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" tabindex="-1" :class="{'link-not-active': !hasPrevious}"
              @click="paginationConfig.currentPage--">Previous</a>
        </li>
        <li v-for="num in normalizePaginationLinks" :key="num" class="page-item"
          :class="{'active':num == (paginationConfig.currentPage + 1)}">
          <a class="page-link" href="#" @click="changePage(num)">{{num}}</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="#" :class="{'link-not-active': !hasNext}"
            @click="paginationConfig.currentPage++">Next</a>
        </li>
      </ul>
    </nav>

      </div> <!--/card -->
    </div><!-- /col -->
    </div>
  </div> <!--/container -->

  <flash :message="flash.msg" :type="flash.type" v-if="shouldFlash" @finished="clearFlash"></flash>
  <spinner v-show="spin"></spinner>
</section>
</template>

<script>

import Timeline_Component from './timeline.vue';


/* ---- TO DO ---- */
/* ADD PREVENT DUPLICATE CHECK WHENEVER TIMELINE ADDED/EDITED */
/* SELECT BOX ICONS ON LEFT OF TABLE TO DELETE MULTIPLE ITEMS */

export default {
  name: 'timeline-register',

  components: {
    'timeline': Timeline_Component
  },
  
  data () {
    return {
      title: '',
      searching: false,
      adding: false,
      sortingTitle: false,
      sortingDate: false,
      timelineTitleSortedDesc: false,
      timelineDateSortedDesc: false,
      searchInput: '',
      numberOfResults: '',
      submitted: false,
      flash: {
        msg: '',
        type: ''
      },
      spin:false,
      /* This object deals with pagination options */
      paginationConfig: {
        numberPerPage: 5,
        currentPage: 0, /* Set to 0 for convenience when slicing the timeline list */
      }
    }
  },

  computed: {
    numberOfTimelines() {
      return this.$store.getters.numberOfTimelines;
    },

    timelines() {
      return this.sortChronologically(this.$store.getters.timelines);
    },

    timelineSearchResults() {
      return this.$store.getters.timelineSearchResults(this.searchInput);
    },
    numberOfSearchResults() {
      return this.timelineSearchResults.length;
    },

    disabled() {
      return this.errors.any() || this.title.length == 0
    },

    titleSorting() {
      return {
        'fas': this.sortingTitle,
        'fa-angle-down': this.sortingTitle && !this.timelineTitleSortedDesc,
        'fa-angle-up': this.sortingTitle && this.timelineTitleSortedDesc,
      }
    },
    dateSorting() {
      return {
        'fas': this.sortingDate,
        'fa-angle-down': this.sortingDate && !this.timelineDateSortedDesc,
        'fa-angle-up': this.sortingDate && this.timelineDateSortedDesc,
      }
    },

    shouldFlash() {
      return this.adding && this.submitted
    },

    /******** PAGINATION METHODS *********/

    /* Determines if pagination should occur */
    paginate() {
      return this.paginationConfig.numberPerPage < this.numberOfSearchResults
    },

    /* Returns the number of pagination links to be generated */
    numberOfPages() {
      let factor = this.timelineSearchResults.length % this.paginationConfig.numberPerPage == 0
      if (factor)
        return this.timelineSearchResults.length / this.paginationConfig.numberPerPage
      else
        return Math.ceil(this.timelineSearchResults.length / this.paginationConfig.numberPerPage)
    },

    /* There could be a lot of pages!
       Normalize to only return a list of those near the current page by setting boundaries */
    normalizePaginationLinks() {
      let cur = this.paginationConfig.currentPage + 1
      let minBoundary = this.hasPrevious ? cur - 1 : cur
      let maxBoundary = this.hasNext ? cur + 1 : cur
      let range = maxBoundary - minBoundary + 1
      let nums = Array.from(Array(range).keys())
      return nums.map(num => num + minBoundary)
    },

    /* Determines if the 'previous' pagination link should be active */
    hasPrevious() {
      return this.paginationConfig.currentPage > 0
    },

    /* Determines if the 'next' pagination link should be active */
    hasNext() {
      return this.paginationConfig.currentPage < (this.numberOfPages - 1)
    },

    /* Retrieves the start-index for paginating (slicing) the main list of timelines */
    paginationStartIndex() {
      if (this.paginationConfig.currentPage == 0) return 0
      return this.paginationConfig.currentPage * parseInt(this.paginationConfig.numberPerPage)
    },

    /* Retrieves the last-index for paginating (slicing) the main list of timelines */
    paginationEndIndex() {
      let perPage = parseInt(this.paginationConfig.numberPerPage)
      let start = this.paginationStartIndex
      if ((start + perPage) > this.timelineSearchResults.length)
        return this.timelineSearchResults.length
      else
        return parseInt(start + perPage)
    },

    /* Retrieves the paginated list of timelines for the current page */
    paginatedTimelines() {
      if (this.paginate) {
           let start = this.paginationStartIndex
           let end = this.paginationEndIndex
           return this.timelineSearchResults.slice(start,end)
      } else {
        return this.timelineSearchResults
      }
    },
  }, 

  methods: {

    addTimeline() {
        this.$validator.validate('add-timeline', this.title)

        if (this.isDuplicateTitle(this.title)) {
          this.setFlash("Duplicate title cannot be entered", "warning")
          return
        }

        if (!this.errors.any()) {
          this.$store.dispatch('addTimeline', {title: this.title})
            .then(response => {
              this.setFlash("Timeline added successfully", "success")
            })
            .catch(err => {
              this.setFlash("Error occurred", "warning")
            });
          this.title = ''
        } else {
          this.setFlash("Errors in form", "warning")
        }
    },

    sortTitle() {
      this.sortingTitle = true
      this.sortingDate = false

      this.clearArrows('table-date')
      this.toggleArrows("table-title")

      this.timelineTitleSortedDesc = !this.timelineTitleSortedDesc
      return this.timelineTitleSortedDesc 
          ? this.sortAlphabetically(this.paginatedTimelines)
          : this.sortAlphabetically(this.paginatedTimelines).reverse()
    },

    sortDate() {
      this.sortingDate = true
      this.sortingTitle = false

      this.clearArrows("table-title")
      this.toggleArrows('table-date')

      this.timelineDateSortedDesc = !this.timelineDateSortedDesc
      return this.timelineDateSortedDesc 
          ? this.sortChronologically(this.paginatedTimelines)
          : this.sortChronologically(this.paginatedTimelines).reverse()
    },

    sortAlphabetically(timelines) {
      return timelines.sort((a,b) => {
        if (a.Title.toLowerCase() < b.Title.toLowerCase()) return -1;
        if (a.Title.toLowerCase() > b.Title.toLowerCase()) return 1;
        return 0; //should never be reached as duplicates are prevented
      });
    },

    sortChronologically(timelines) {     
      return timelines.sort((a,b) => {
        if (a.CreationTimeStamp < b.CreationTimeStamp) return -1;
        if (a.CreationTimeStamp > b.CreationTimeStamp) return 1;
        return 0;
      });
    },

    isDuplicateTitle(newTitle) {
      let found = false
      this.timelines.forEach(timeline => {
        if (timeline.Title.toLowerCase() == newTitle.toLowerCase()) {
          found = true
          return
        }
      });
      return found;
    },

    changePage(num) { this.paginationConfig.currentPage = parseInt(num) - 1 },

    changedNumberPerPage() { this.paginationConfig.currentPage = 0},

    search() {
      return this.timelineSearchResults;
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

    timelineDeleted(id) {
      let index = this.timelines.findIndex(timeline => timeline.Id == id)
        if (index < 0) {
          this.setFlash("Timeline was deleted!", "success")
        }
    },

    /* jQuery helpers */
    toggleArrows(tableHeader) {

      var header = $('#' + tableHeader + ' > svg').length ? $('#' + tableHeader + ' > svg') : null
      if (header) {
        let sortClass = $(header).attr('data-icon')
        
        if (sortClass == 'angle-up') $(header).addClass('fa-angle-down').removeClass(sortClass)

        else $(header).addClass('fa-angle-up').removeClass(sortClass)

        $(header).show()
      }
    },

    clearArrows(tableHeader) {
      $("#" + tableHeader + ' > svg').hide()
    }

  },

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.sortableTableHeader {
  cursor: pointer;
}

.counter{
  padding:8px; 
  color:#ccc;
}

#timeline_register_container, #add_timeline_form {
  margin-top: 1em;
}

#add_timeline_btn {
  border-radius: 5px 5px 5px 5px;
} 


h1.lead {
  font-size: 28px;
  font-family: aileron;
  padding:10px;
}

#paginate-links, paginator {
  display:inline;
}

.searchTransition-enter-active, .addTransition-enter-active {
  transition: all .4s ease;
}

.searchTransition-leave-active, .addTransition-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.searchTransition-enter, .searchTransition-leave-to, .addTransition-enter, .addTransition-leave-to {
    transform: translateX(10px);
    opacity: 0;
}

.card-header {
  background: mediumaquamarine;
}

h2 > strong {
  color: white;
  text-transform:uppercase;
}

.link-not-active {
  pointer-events: none;
  cursor: none;
  text-decoration:none;
  color:black;
}

#pagination-msg {
  margin-top: 10px;
  margin-bottom:10px;
}

#pagination-msg > ul {
  list-style-type: square;
}

.register-icons {
  cursor: pointer;
}
</style>

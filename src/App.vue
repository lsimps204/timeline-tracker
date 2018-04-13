<template>
  <div id="app">
    <header>
    	<a href="http://localhost:8080/" class="hyperlink-logo">
        <img id="logo" src="/src/assets/LOGO2.png" alt="Logo">
        <h1 id="brand">Aileron Airways</h1>
      </a>
      <hr/>
    </header>
        <router-view></router-view>
        <spinner v-show="spin"></spinner>
  </div>
</template>

<script>
 
import TimelineRegister from './components/timeline_register.vue'
import Timeline from './components/timeline.vue'
import Event from './components/event.vue'


export default {
  name: 'app',

  components: { TimelineRegister, Timeline, Event },

  data () {
    return {
      spin: true
    }
  },

  created() {
    this.$store.dispatch('getAllTimelinesWithEvents')
      .then(response => {this.spin = false})
    //this.$store.dispatch('getEvents')
  }
}
</script>

<style>

 a.hyperlink-logo:link {
    color: transparent; 
    text-decoration: none;
}

 a.hyperlink-logo:visited {
    color: transparent;
    text-decoration: none;
}

 a.hyperlink-logo:hover {
    color: transparent;
    text-decoration: none;
}

 a.hyperlink-logo:active {
    color: transparent;
    text-decoration: none;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
  background: blue;
}

#brand {
  color: #eeeeee;
  margin-left: 3.5ex;
  padding-top: 1ex;
  padding-left: 25px;
  font-size: 40px;
}

#logo {
  padding-top: 1.5ex;
  padding-left: 2ex;
  padding-bottom: 1ex;
  width:5.5em;
  height:5.5em;
  display: inline; 
  float: left;
}
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .05s;
}

.fade-enter-active {
  transition-delay: .05s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}

#app {
  margin-bottom: 50px;
}
</style>

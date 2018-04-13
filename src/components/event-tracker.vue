<template>
<div class="row">
	<div id="menu" class="col-12 col-md-3 border-right">
		<div class="col-6 col-sm-12 card">
			<div class="card-header mapcardheader">
				<h2 class="mb-2 text-center card-title" id="sidebar-header">Event List</h2>
			</div>
			<div class="card-body px-0">
				<ul class="list-group col-12">
					<li class="list-group-item maplist" v-for="e,i in eventsOrdered" 
						:key="e.Id" @click="centreMapAtEvent(e)">{{ i+1 }}: {{ e.Title }}
					</li>
				</ul>
			</div>
		</div>
		<hr/>
		<div class="slider item">
			<div class="label">scale (<span class="value">{{mapScale}}</span>)</div>
			<div>
				<span class="low">300</span> 
				<input type="range" name="scale" min="300" max="6000" 
					:value="mapScale" @change="updateScale">
				<span>6000</span>
			</div>
		</div>
		<div class="slider item">
			<div class="label">center (lon) (<span class="value">{{mapCentre.lon | round }}</span>)</div>
			<div>
				<span class="low">-180</span> 
				<input type="range" name="centerLon" min="-180" max="180" 
					:value="mapCentre.lon" @change="updateLongitude"> 
				<span>180</span>
			</div>
		</div>
		<div class="slider item">
			<div class="label">center (lat) (<span class="value">{{ mapCentre.lat | round }}</span>)</div>
			<div>
				<span class="low">-90</span> 
				<input type="range" name="centerLat" min="-90" max="90" 
					:value="mapCentre.lat" @change="updateLatitude"> 
				<span>90</span>
			</div>
		</div>
	</div>

	<div id="d3map" class="col-12 col-md-9">
		<span class="zoom mr-1" @click="updateScale($event, 'minus')">
			<i class="fas fa-minus fa-lg"></i>
		</span>
		<span class="zoom mb-1" @click="updateScale($event, 'plus')">
			<i class="fas fa-plus fa-lg"></i>
		</span>
		<button class="float-right mr-3 btn btn-primary btn-sm" @click="reset">Reset Map</button>
		<svg id="eventmap" :width="width" :height="height">
			<g class="map"></g>
		</svg>
	</div>
</div>
</template>

<script>

import * as d3 from 'd3';
import * as topojson from 'topojson'
import topology from '../assets/world-topojson.js'

import EventForm from './subcomponents/add_event_form.vue';
import Event from '../models/Event.js'

/* global variables for the map */

/* Holds the topological JSON data */
// console.log(topology.objects)
var geojson = topojson.feature(topology, topology.objects.countries)

/* Countries in the above geojson object are identified by their ISO 3166-1 numeric code. 
	Use that to filter down the map, possibly? */

/* Projects spherical longitude-latitude coordinates to a planar representation */
var projection = d3.geoStereographic()

/* Constructs the SVG paths from the given projection */
var path = d3.geoPath(projection)

export default {
	name: 'event-tracker',
	props: ['id'],

	data() {
		return {
			timeline_id: this.id,
			eventLocationPath: [],
			mapScale: 1250,
			mapCentre: {
				lon: 0,
				lat: 0
			},
			width: 900,
			height: 700,
			zoomConfig: {
				add: 500,
				rm: 500
			},
			tooltip: null
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

		eventCount() { return this.eventsOrdered.length }
	},

	methods: {
		/* Construct an array of [lon,lat] pairs from the events in the timeline */
		eventsGeoPath() {
			if (this.eventCount) {
				this.eventsOrdered.forEach(event => {
					try {
						const coordinates = JSON.parse(event.Location);
						this.eventLocationPath.push(coordinates);
					} catch (e) { console.log(e) }
				})
			}
		},

		sortChronologically(events) {     
	      return events.sort((a,b) => {
	        if (a.EventDateTime < b.EventDateTime) return -1;
	        if (a.EventDateTime > b.EventDateTime) return 1;
	        return 0;
	      });
		},

		dragged(d) {
			console.log(d.x,d.y)
			this.setCentre({x: d.x, y: d.y})
			this.update()
		},

		centreMapAtEvent(e) {
			let centreCoordinates;
			try {
				var coords = JSON.parse(e.Location)
				this.mapCentre.lon = coords.longitude
				this.mapCentre.lat = coords.latitude
			} catch(error) { console.log ("Error")}
			this.mapScale = 3500
			this.update()			
		},

		/* Center the map, by default, on the first event's longitude/latitude coordinates, or on the params passed in */
		setCentre(coords) {
			if (!coords) {
				let centreCoordinates = [this.eventLocationPath[0].longitude, this.eventLocationPath[0].latitude]
				this.mapCentre.lon = centreCoordinates[0]
				this.mapCentre.lat = centreCoordinates[1]
			}
			else {
				let centreCoordinates = projection.invert([coords.x, coords.y])
				this.mapCentre.lon = centreCoordinates[0]
				this.mapCentre.lat = centreCoordinates[1]
			}
		},

		/****** Update functions for the projection attributes *****/
		
		/* Updates scale.
		   e = event ('click' for icons, or 'change' for the slider)
		   dir = direction of change when the slider is used */
		updateScale(e, dir='') {
			if (e && e.type == "change") {
				this.mapScale = parseFloat(e.target.value)
			}
			else if (e && e.type == "click") {
				if (dir == "plus") {
					if (this.mapScale > 1000) this.mapScale += this.zoomConfig.add
					else if (this.mapScale <= 1200 && this.mapScale > 550) this.mapScale += 250
					else if (this.mapScale <= 550 && this.mapScale >= 400) this.mapScale += 100
					else if (this.mapScale < 400) this.mapScale += 50
				}
				else if (dir == "minus") {
					/* If scale is low, lower the reduction factor to allow viewing from massively scaled out parameters */
					if (this.mapScale > 1000) this.mapScale -= this.zoomConfig.rm
					else if (this.mapScale <= 1200 && this.mapScale > 550) this.mapScale -= 250
					else if (this.mapScale <= 550 && this.mapScale >= 400) this.mapScale -= 100
					else if (this.mapScale < 400) this.mapScale = 300
				}
				else {}
			} 
			else {
				this.mapScale += this.zoomConfig.add
			}
			this.update()
		},

		/* Updates the longitude of the centre of the map */
		updateLongitude(e) {
			this.mapCentre.lon = parseFloat(e.target.value)
			this.update()
		},

		/* Updates the latitude of the centre of the map */
		updateLatitude(e) {
			this.mapCentre.lat = parseFloat(e.target.value)
			this.update()
		},
		
		/* Redraws map: called after any scale, [lon,lat] or translate values are changed */
		update() {
			projection
				.scale(this.mapScale)
				.center([this.mapCentre.lon, this.mapCentre.lat])
			let u = d3.select("g.map").selectAll("path").data(geojson.features)
			u.enter().append("path").merge(u).attr("d",path)
			this.drawEventPoints()
		},

		/* Restore map to its initial state */
		reset() {
			this.mapScale = 1250
			this.setCentre()
			this.initMap()
		},

		/* Render the world map from the topojson */
		initMap() {
			projection
				.scale(this.mapScale)
				.center([this.mapCentre.lon, this.mapCentre.lat])
				.translate([this.width/2, this.height/2])
				.precision(.1);
			path = d3.geoPath(projection)

			/* Select the DOM element, and append the geojson feature paths to it */
			let u = d3.select("g.map")	
				.selectAll("path")
				.data(geojson.features)
			
			/* Set event listener to enable dragging
			   When dragging, we need to change the projection's centre property  */
			d3.select("g.map").call(d3.drag().on("drag.mouseup", () => {
				d3.event.sourceEvent.stopPropagation();
				this.dragged(d3.event)
			}))

			/* Set event listener to enable zooming when the map is double-clicked.
			   When zooming, we need to change the projection's scale property  */
			d3.select("g.map").call(d3.zoom().on("zoom.dblclick", this.updateScale));

			u.enter()
				.append("path")
				.merge(u)
				.attr("d",path)
			
			/* Set up the tooltip to show event details */
			this.tooltip = d3.select("body")
			.append("div")
			.style("position", "absolute")
			.style("z-index", "10")
			.style("visibility", "hidden")
			.style("color", "white")
			.style("background", "black")
			.style("border-radius", "5px")
			.style("padding", "5px")
			.text("");


			this.drawEventPoints()
		},

		/* Renders circular points on the map where the events have occurred
		   Also attaches mouse listeners to the circles in order to display a tooltip on hovering */
		drawEventPoints() {
			let u = d3.select("g.map")
				.selectAll("circle")
				.attr("cx", d => projection(d)[0])
				.attr("cy", d => projection(d)[1])
				.data(this.eventLocationPath.map(loc => {
					return [loc.longitude,loc.latitude]
				}))
			
			u.enter().append('circle')
				.attr("cx", d => projection(d)[0])
				.attr("cy", d => projection(d)[1])
				.attr("r", 3)
				.style("fill", "red")
				.on("mouseover", this.tooltipListener)
				.on("click", this.tooltipListener)
				.on("mouseout", () => {
					d3.select(event.target).transition().attr('r', 3) /* Decrease circle radius on hover */
					this.tooltip.style("visibility", "hidden")
				})
			
			// let text = d3.select("g.map")
			// 	.selectAll("text")
			// 	.attr("x", d=> projection(d)[0])
			// 	.attr("y", d=>projection(d)[1])
			// 	.data(this.eventLocationPath.map(loc => {
			// 		return [loc.longitude,loc.latitude]
			// 	}))
			// 	.enter().append("text")
			// 	.attr("x", d => projection(d)[0] + 10)
			// 	.attr("y", d => projection(d)[1] + 10)
			// 	.text(d =>"hello")
		},

		/* Determines what happens on mousing over an event point on the map */
		tooltipListener(d) {
			d3.select(event.target).transition().attr('r', 6) /* Increase circle radius on hover */
			let thisEvent = this.eventsOrdered.findIndex(event => event.Location == JSON.stringify({
				latitude: d[1],
				longitude: d[0]
			}))
			if (thisEvent >= 0) {
				let eventNumber = thisEvent + 1
				thisEvent = this.eventsOrdered[thisEvent]
				this.displayTooltip(event.pageY-10, event.pageX+10, `Event #${eventNumber}: ${thisEvent.Title}`)
			}
		},

		displayTooltip(x,y,message) {
			this.tooltip.style("visibility","visible")
				.style("top", x+"px")
				.style("left", y+"px")
				.text(message)
		},

	},

	filters: {
		round(val) { return val.toFixed(2) }
	},

	mounted() {
		this.eventsGeoPath()
		this.setCentre()
		this.initMap()
	}
}
</script>

<style>
#eventmap {
	border: 2px solid #eee;
	border-radius: 360px;
	background: lightblue;
}

#d3map path {
  fill: #87B687;
  stroke: #777;
}

#d3map path:hover {
  fill: darkslategray;
  stroke: #777;
}

#menu .item {
  margin-bottom: 12px;
}

#menu .item input {
  width: 150px;
}

#menu .item .low {
  display: inline-block;
  width: 30px;
  text-align: right;
}

.projection-center {
  fill: red;
}

#menu .item .value {
  font-weight: bold;
}
.circles path {
  fill: none;
  stroke: #aaa;
}

circle:hover {
	color: black;
}

.zoom {
	cursor: pointer;
	border: 2px solid #eee;
    border-radius: 5px;
    padding: 4px;
}

.maplist {
	overflow-wrap: break-word;
	color: blue;
}

.maplist:hover {
	text-decoration: underline;
	cursor: pointer;
}

#sidebar-header {
	font-size: 20px;
	font-weight: bold;
	text-decoration: underline;
	background: white;
}

.mapcardheader {
	background:white
}
</style>
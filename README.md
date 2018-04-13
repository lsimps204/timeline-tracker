# Timeline tracker

This application can be used to track aviation incidents that occur. It was build as part of a university project, and tracks timelines representing each incident. Each timeline is composed of events and attachments, and each event is associated with a location chosen via Google Maps.

The application is a single-page application, and in order to store and retrieve details of the above entities, it interacts with a pre-determined API via HTTP requests.

The server scripts (Node/Express, and Flask) were included initially to permit cross-origin requests to the API, as the API did not accept these at first. However, the API was changed to permit CORS, so these server scripts became redundant. Nonetheless, they're included.

Technologies used:

* Axios: for performing HTTP requests
* Vue.js: the JavaScript framework used to build the single page application.
* Vue-router: for front-end routing.
* Vuex: to allow use of the Flux architectural pattern, where application state is housed in a single store available to all components.
* d3.js: for creating visualizations based on data existing in the store.
* Google Maps API
* Jest/Vue-test-utils: used in combination to allow testing of application components
* Vee-validate: For validating user form inputs
* Webpack: for building the application and compiling assets
* Bootstrap and Bulma: CSS frameworks for styling the app.

Server:
* Flask: Python web micro-framework for forwarding the SPA Axios requests to the API. Forwarding done via the Requests library.
* Node/Express: Forwards the SPA Axios requests to the API.


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

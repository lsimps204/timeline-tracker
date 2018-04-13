<template>
	<div class="alert alert-flash" :class="alertClass" role="alert" v-show="show">
	  <strong>{{ message_type | capfirst }}:</strong> {{ body }}
	</div>
</template>


<script>

export default {
	props: ['message', 'type'],

	data() {
		return {
			body: '',
			show: false,
			message_type: ''
		}
	},

	computed: {
		/* Translate 'warning' to 'danger' */
		alertClass() {
			return this.message_type == 'success' 
				? "alert-" + this.message_type 
				: "alert-danger"
		}
	},

	methods: {

		display(message, type="success") {
			this.body = message
			this.message_type = type
			this.show = true
			this.hide()
		},

		hide() {
			setTimeout(() => {
				this.show = false;
				this.$emit("finished")
			}, 2000)
		}
	},

	filters: {
		capfirst(string) { return string[0].toUpperCase() + string.slice(1,string.length) }
	},

	created() {
		if (this.type) {
			this.display(this.message, this.type)
		} else {
			this.display(this.message)
		}
	}
}

</script>

<style>

.alert-flash {
	position: fixed;
	right: 25px;
	bottom: 25px;
}
</style>
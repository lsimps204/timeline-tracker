<template>
	<div class="attachment-field">

		<div class="modal is-active">
		  <div class="modal-background"></div>
		  <div class="modal-card">
		    <header class="modal-card-head">
		      <p class="modal-card-title">Add attachments</p>
		      <button class="delete" aria-label="close" @click="close"></button>
		    </header>
		    <section class="modal-card-body float-left">
		      
		    <div class="form-group">
		    	<label for="attachmentTitle" class="form-control-label">Attachment Title</label>
		    	<input type="text" class="form-control" name="attachmenttitle" id="attachmentTitle" v-model="title" v-validate="'min:3'"/>
			  	<span v-show="errors.has('attachmenttitle') && title!=''" class="help is-danger">{{ errors.first('attachmenttitle') }}</span>
		    </div>

			<div class="file">
			  <label class="file-label">
			    <input class="file-input" id="customFile" type="file" name="file-upload" @change="fileChange($event)" accept=".docx, .png, .jpg, .jpeg" v-validate="'ext:docx,png,jpg,jpeg'" v-validate.reject="'image|size:10'"/>
			    <span class="file-cta">
			      <span class="file-icon">
			        <i class="fas fa-upload"></i>
			      </span>
			      <span class="file-label">
			        Choose a file…
			      </span>
			    </span>
			    <span class="ml-2 text-danger" v-show="hasTitle">Add title for this attachment</span>
			  </label>
			</div>

			<div class="file-list mt-3" v-show="size">
				<strong>Attached files:</strong>
				<ul class="mb-4 pl-4">
					<li v-for="f in titles()">{{f[0]}} - <em>{{f[1].name}}</em></li>
				</ul>

				<a class="pt-4 mt-4" href="#" @click="clear">Click here</a> to clear attachments
			</div>

		    </section>
		    <footer class="modal-card-foot">
		      <button class="button is-success" @click.prevent="submit">Save changes</button>
		      <button class="button" @click="close">Cancel</button>
		    </footer>
		  </div>
		</div>

	</div>
</template>


<script>

export default {
	name: 'add-attachment',
	data() {
		return {
			attachment: new Map(),
			title: '',
			filesChosen: false,
			size: 0,
			base64Map: new Map()
		}
	},

	computed: {
		hasTitle() { return this.title.length < 3 }
	},

    methods: {
    	/* Add file(s) to the FormData object when user selects using file-input field */
        fileChange(event) {
					console.log("fired")
        	if (this.title.length < 3) {
        		this.title = ''
        		alert("please enter a valid title")
        		return
        	}
        	let file = event.target.files
        	if (file.length == 1) this.filesChosen = true
        	else this.filesChosen = false

        	let i = this.isValidFile(file[0])

        	if (this.filesChosen && this.title.length >= 3 && i) {
	            this.attachment.set(this.title, file[0])

	            /* Convert file to Base64 */
	            this.getBase64(this.title, file[0]).then(response => {
	            	this.base64Map.set(response.title, response.result)
	            })
        	}
        	this.size = this.attachment.size
        	this.title = ''
        	document.getElementById("customFile").value = ""
        },

        close() {
        	this.$emit("close")
        },

        getBase64(title, file) {
		  return new Promise((resolve, reject) => {
		    const reader = new FileReader();
		    reader.readAsDataURL(file);
		    reader.onload = () => resolve({'title': title, 'result': reader.result});
		    reader.onerror = error => reject(error);
		  });
		},

        submit() {
        	this.$emit("getFiles", {
        		'attachment': this.attachment, 
        		'formdataMap': this.base64Map
        	})
        	this.$emit("close")
        },

        titles() {
        	return Array.from(this.attachment.entries())
        },

        isValidFile(file) {
        	var validTypes = ["docx", "png", "jpeg", "jpg"]
    		for (let type of validTypes) {
    			if (file.name.endsWith("." + type)) return true
			}
			return false
        },

        clear() {
        	this.attachment = new Map()
        	this.title = ''
        	this.size = 0
        	this.base64Map = new Map()

        	this.$emit("clear")
        }
    },

}
</script>

<style>

ul {
	list-style-type: circle;
}
</style>